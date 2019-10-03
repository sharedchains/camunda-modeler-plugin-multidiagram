'use strict';

var inherits = require('inherits');
var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');
var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
        getBusinessObject = ModelUtil.getBusinessObject,
        is = ModelUtil.is;
var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
var find = require('lodash.find'),
    findIndex = require('lodash.findindex'),
    assign = require('lodash.assign');

function getCallableType(element) {
  var bo = getBusinessObject(element);

  var boCalledElement = bo.get('calledElement'),
    boCaseRef = bo.get('camunda:caseRef');

  var callActivityType = '';
  if (typeof boCalledElement !== 'undefined') {
    callActivityType = 'bpmn';
  } else

  if (typeof boCaseRef !== 'undefined') {
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

function CallActivityExt(eventBus, bpmnFactory, elementRegistry, elementTemplates, translate, propertiesProvider, diagramUtil) {
  PropertiesActivator.call(this, eventBus);

  let camundaGetTabs = propertiesProvider.getTabs;
  var diagrams;
  var currentRootElement;
  var rootElements;

  propertiesProvider.getTabs = function (element) {
    eventBus.on('import.done', function(context) {
      diagrams = diagramUtil.diagrams();
      rootElements = diagramUtil.definitions().rootElements;
      currentRootElement = diagramUtil.currentRootElement().id;
    });

    eventBus.on('commandStack.diagram.create.executed', function(context) {
      currentRootElement = context.context.newProcess.id;
    });

    eventBus.on('commandStack.diagram.switch.executed', function(context) {
      currentRootElement = getRootElement(context.context.id);
    });

    function getRootElement(diagramId) {
      var diagram = find(diagramUtil.diagrams(), {id: diagramId});
      return diagram.plane.bpmnElement.id;
    };

    var array = camundaGetTabs(element);
    if (is(element, 'bpmn:CallActivity') && diagrams.length > 1 && getCallableType(element) === 'bpmn') {

      let generalTab = find(array, {id: "general"});
      if (!!generalTab) {
        let detailsGroup = find(generalTab.groups, {id: "details"});
        let callActivitySelectIndex = findIndex(detailsGroup.entries, {id : "callActivity"});

          detailsGroup.entries.splice(callActivitySelectIndex+1, 0, entryFactory.selectBox({
            id : 'callable-element-type-ref',
            label: translate('Called Element Type'),
            selectOptions: [
                { name: 'INTERNAL', value : 'internal'},
                { name: 'EXTERNAL', value : 'external'}
            ],
            modelProperty: 'calledElementType',
            get: function(element, node) {
              return {
                calledElementType: getCalledElementType(element)
              };
            },

            set: function(element, values, node) {
              var type = values.calledElementType;
              var props = {};
              if (type === 'internal') {
                props.calledElement = 'inner:';
              }
              else if (type === 'external') {
                props.calledElement = '';
              }
              return cmdHelper.updateProperties(element, props);
            }
          }));
          let callableElementIndex = findIndex(detailsGroup.entries, {id : "callable-element-ref"});
          if (getCalledElementType(element) === 'internal') {
            detailsGroup.entries.splice(callableElementIndex, 1);
            detailsGroup.entries.splice(callableElementIndex, 0, entryFactory.selectBox({
              id: 'callable-inner-element-ref',
              label: translate('Called Element'),
              modelProperty: 'callableElementRef',
              selectOptions: rootElements
                .filter((rootElement) => rootElement.id !== currentRootElement)
                .map((rootElement) => {
                    return { name: rootElement.id, value: rootElement.id };
                }),
              emptyParameter: true,
              get: function(element, node) {
                  var bo = getBusinessObject(element);
                  var callableElementRef = bo.get('calledElement');

                  return {
                    callableElementRef: callableElementRef.replace(/^(inner:)/,"")
                  };
              },
              set: function(element, values, node) {
                var newCallableElementRef = values.callableElementRef;
                var props = {};
                props['calledElement'] = 'inner:' + newCallableElementRef || 'inner:';

                return cmdHelper.updateProperties(element, props);
              },
              validate: function(element, values, node) {
                var elementRef = values.callableElementRef;
                return !elementRef ? { callableElementRef: translate('Must provide a value') } : {};
              }
            }));

          }
      }
    }
    return array;
  }
}

inherits(CallActivityExt, PropertiesActivator);

CallActivityExt.prototype.getCallableType = function(element) {
  return getCallableType(element);
}

CallActivityExt.$inject = [
  'eventBus', 'bpmnFactory', 'elementRegistry', 'elementTemplates', 'translate', 'propertiesProvider', 'diagramUtil'
];

export default {
  __init__: [ 'callActivityExt' ],
  callActivityExt: [ 'type', CallActivityExt ]
};
