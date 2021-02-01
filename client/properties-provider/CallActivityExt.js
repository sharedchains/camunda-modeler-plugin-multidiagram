'use strict';

import inherits from 'inherits';

import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

import { find, findIndex } from 'lodash';

function getCallableType(element) {
  var bo = getBusinessObject(element);

  var boCalledElement = bo.get('calledElement'),
    boCaseRef = bo.get('camunda:caseRef');

  var callActivityType = '';
  if (typeof boCalledElement !== 'undefined') {
    callActivityType = 'bpmn';
  } else if (typeof boCaseRef !== 'undefined') {
    callActivityType = 'cmmn';
  }

  return callActivityType;
}

function getCalledElementType(element) {
  var bo = getBusinessObject(element);
  var boCalledElement = bo.get('calledElement');

  var calledElementType = 'external';
  if (typeof boCalledElement !== 'undefined' &&
    boCalledElement.startsWith('inner:')) {
    calledElementType = 'internal';
  }

  return calledElementType;
}

export default function CallActivityExt(eventBus, translate, propertiesProvider, diagramUtil) {
  PropertiesActivator.call(this, eventBus);

  let camundaGetTabs = propertiesProvider.getTabs;
  var diagrams;
  var currentRootElement;
  var rootElements;

  propertiesProvider.getTabs = function(element) {
    eventBus.on('import.done', function() {
      diagrams = diagramUtil.diagrams();
      rootElements = diagramUtil.definitions().rootElements;
      currentRootElement = diagramUtil.currentRootElement().id;
    });

    eventBus.on('commandStack.diagram.create.executed', function(context) {
      currentRootElement = context.context.newProcess.id;
    });

    eventBus.on('diagram.switch', function(event) {
      currentRootElement = getRootElement(event.diagram.id);
    });

    function getRootElement(diagramId) {
      var diagram = find(diagramUtil.diagrams(), { id: diagramId });
      return diagram.plane.bpmnElement.id;
    }

    var array = camundaGetTabs(element);
    if (is(element, 'bpmn:CallActivity') && diagrams.length > 1 && getCallableType(element) === 'bpmn') {

      let generalTab = find(array, { id: 'general' });
      if (generalTab) {
        let detailsGroup = find(generalTab.groups, { id: 'details' });
        let callActivitySelectIndex = findIndex(detailsGroup.entries, { id: 'callActivity' });

        detailsGroup.entries.splice(callActivitySelectIndex + 1, 0, entryFactory.selectBox(translate, {
          id: 'callable-element-type-ref',
          label: translate('Called Element Type'),
          selectOptions: [
            { name: 'INTERNAL', value: 'internal' },
            { name: 'EXTERNAL', value: 'external' }
          ],
          modelProperty: 'calledElementType',
          get: function(element) {
            return {
              calledElementType: getCalledElementType(element)
            };
          },

          set: function(element, values) {
            var type = values.calledElementType;
            var props = {};
            if (type === 'internal') {
              props.calledElement = 'inner:';
            } else if (type === 'external') {
              props.calledElement = '';
            }
            return cmdHelper.updateProperties(element, props);
          }
        }));
        let callableElementIndex = findIndex(detailsGroup.entries, { id: 'callable-element-ref' });
        if (getCalledElementType(element) === 'internal') {
          detailsGroup.entries.splice(callableElementIndex, 1);
          detailsGroup.entries.splice(callableElementIndex, 0, entryFactory.selectBox(translate, {
            id: 'callable-inner-element-ref',
            label: translate('Called Element'),
            modelProperty: 'callableElementRef',
            selectOptions: rootElements
              .filter((rootElement) => rootElement.id !== currentRootElement)
              .map((rootElement) => {
                return { name: rootElement.id, value: rootElement.id };
              }),
            emptyParameter: true,
            get: function(element) {
              var bo = getBusinessObject(element);
              var callableElementRef = bo.get('calledElement');

              return {
                callableElementRef: callableElementRef.replace(/^(inner:)/, '')
              };
            },
            set: function(element, values) {
              var newCallableElementRef = values.callableElementRef;
              var props = {};
              props['calledElement'] = 'inner:' + newCallableElementRef || 'inner:';

              return cmdHelper.updateProperties(element, props);
            },
            validate: function(_element, values) {
              var elementRef = values.callableElementRef;
              return !elementRef ? { callableElementRef: translate('Must provide a value') } : {};
            }
          }));

        }
      }
    }
    return array;
  };
}

inherits(CallActivityExt, PropertiesActivator);

CallActivityExt.prototype.getCallableType = function(element) {
  return getCallableType(element);
};

CallActivityExt.$inject = ['eventBus', 'translate', 'propertiesProvider', 'diagramUtil'];