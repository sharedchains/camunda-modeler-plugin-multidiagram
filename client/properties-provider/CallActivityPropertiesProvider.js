'use strict';

import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { find } from 'min-dash';

import calledTypeProps from './props/CalledTypeProps';
import calledElementProps from './props/CalledElementProps';

function getCallableType(element) {
  const bo = getBusinessObject(element);

  const boCalledElement = bo.get('calledElement'),
        boCaseRef = bo.get('camunda:caseRef');

  let callActivityType = '';
  if (typeof boCalledElement !== 'undefined') {
    callActivityType = 'bpmn';
  } else if (typeof boCaseRef !== 'undefined') {
    callActivityType = 'cmmn';
  }

  return callActivityType;
}

function isInternal(element) {
  const bo = getBusinessObject(element);
  const boCalledElement = bo.get('calledElement');
  return !!(typeof boCalledElement !== 'undefined' &&
    boCalledElement.startsWith('inner:'));
}

/**
 * A provider for CallActivity elements, to open the global subprocess of the BPMN
 * @constructor
 */
export default class CallActivityPropertiesProvider {

  constructor(propertiesPanel, injector) {
    const eventBus = injector.get('eventBus');
    const bpmnjs = injector.get('bpmnjs');

    this.diagramUtil = injector.get('diagramUtil');

    // Not sure it's the right place but whatever...
    eventBus.on('diagram.switch', 10000, (event) => {
      bpmnjs.open(event.diagram.id);
    });

    propertiesPanel.registerProvider(200, this);
  }


  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  getGroups(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return groups => {

      if (is(element, 'bpmn:CallActivity') && this.diagramUtil.diagrams().length > 1 && getCallableType(element) === 'bpmn') {

        let calledElement = find(groups, (entry) => entry.id === 'CamundaPlatform__CallActivity');

        if (calledElement) {
          calledElement.entries.push(...calledTypeProps(element));

          if (isInternal(element)) {
            calledElement.entries.push(...calledElementProps(element));
          }
        }
      }

      return groups;
    };

  };


}

CallActivityPropertiesProvider.prototype.getCallableType = function(element) {
  return getCallableType(element);
};

CallActivityPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];