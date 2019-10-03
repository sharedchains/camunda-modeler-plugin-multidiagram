var find = require('lodash.find');
var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
  getBusinessObject = ModelUtil.getBusinessObject,
  is = ModelUtil.is;


export default class CustomContextPad {
  constructor(config, eventBus, contextPad, injector, translate) {
    this.translate = translate;
    this.eventBus = eventBus;

    if (config.diagramUtil !== false) {
      this.diagramUtil = injector.get('diagramUtil', false);
    }
    if (config.commandStack != false) {
      this.commandStack = injector.get('commandStack', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      translate,
      diagramUtil,
      commandStack,
      eventBus
    } = this;

    eventBus.on('element.dblclick', 1500, function(event) {
      if (isInternalCallActivity(event.element)){
        // do your stuff here
        openProcess(event, event.element);
        // stop propagating the event to prevent the default behavior
        event.stopPropagation();
      }
    });

    function getDiagram(rootElementId) {
      var diagram = find(diagramUtil.diagrams(), function(diagram) {
        return diagram.plane.bpmnElement && diagram.plane.bpmnElement.id === rootElementId;
      });
      return diagram;
    };

    function openProcess(event, element) {
      let bo = getBusinessObject(element);
      let calledElement = bo.get('calledElement');
      if (calledElement.startsWith('inner:')) {
        let diagram = getDiagram(calledElement.replace(/^(inner:)/, ""));
        if (!!diagram) {
          commandStack.execute('diagram.switch', {
            id: diagram.id
          });
        }
      }
    };

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
