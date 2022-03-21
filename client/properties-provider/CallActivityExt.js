'use strict';

import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { find } from 'lodash';

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
 * @param eventBus
 * @param translate
 * @param propertiesPanel
 * @param diagramUtil
 * @param bpmnjs
 * @constructor
 */
export default function CallActivityExt(eventBus, translate, propertiesPanel, diagramUtil, bpmnjs) {

  // Not sure it's the right place but whatever...
  eventBus.on('diagram.switch', 10000, (event) => {
    bpmnjs.open(event.diagram.id);
  });

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function(element) {

    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function(groups) {

      if (is(element, 'bpmn:CallActivity') && diagramUtil.diagrams().length > 1 && getCallableType(element) === 'bpmn') {

        let calledElement = find(groups, { id: 'CamundaPlatform__CallActivity' });

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

  propertiesPanel.registerProvider(200, this);
}

CallActivityExt.prototype.getCallableType = function(element) {
  return getCallableType(element);
};

CallActivityExt.$inject = [ 'eventBus', 'translate', 'propertiesPanel', 'diagramUtil', 'bpmnjs' ];