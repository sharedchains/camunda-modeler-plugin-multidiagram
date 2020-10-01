import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { find } from 'lodash';


export default class CustomContextPad {
  constructor(config, eventBus, contextPad, injector, translate) {
    this.translate = translate;
    this.eventBus = eventBus;

    if (config.diagramUtil !== false) {
      this.diagramUtil = injector.get('diagramUtil', false);
    }
    if (config.bpmnjs != false) {
      this.bpmnjs = injector.get('bpmnjs', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      translate,
      diagramUtil,
      bpmnjs,
      eventBus
    } = this;

    eventBus.on('element.dblclick', 1500, function (event) {
      if (isInternalCallActivity(event.element)) {
        // do your stuff here
        openProcess(event, event.element);
        // stop propagating the event to prevent the default behavior
        event.stopPropagation();
      }
    });

    function getDiagram(rootElementId) {
      var diagram = find(diagramUtil.diagrams(), function (diagram) {
        return diagram.plane.bpmnElement && diagram.plane.bpmnElement.id === rootElementId;
      });
      return diagram;
    }

    function openProcess(_event, element) {
      let bo = getBusinessObject(element);
      let calledElement = bo.get('calledElement');
      if (calledElement.startsWith('inner:')) {
        let diagram = getDiagram(calledElement.replace(/^(inner:)/, ""));
        if (diagram) {
          bpmnjs.open(diagram.id);
          eventBus.fire('diagram.switch', { diagram: diagram });
        }
      }
    }

    function isInternalCallActivity(element) {
      let bo = getBusinessObject(element);

      return is(element, 'bpmn:CallActivity')
        && diagramUtil.diagrams().length > 1
        && (typeof bo.get('calledElement') !== 'undefined')
        && bo.get('calledElement').startsWith('inner:');
    }

    let newContext = {};
    if (isInternalCallActivity(element)) {
      newContext = {
        'open.process': {
          group: 'model',
          className: 'bpmn-icon-hand-tool',
          title: translate('Open process'),
          action: {
            click: openProcess,
          }
        }
      };
    }
    return newContext;
  }
}

CustomContextPad.$inject = [
  'config',
  'eventBus',
  'contextPad',
  'injector',
  'translate'
];
