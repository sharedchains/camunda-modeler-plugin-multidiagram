import { find, findIndex } from 'min-dash';

export default function DiagramUtil(bpmnjs, canvas) {

  this._bpmnjs = bpmnjs;
  this._canvas = canvas;
}

DiagramUtil.$inject = [
  'bpmnjs',
  'canvas'
];

DiagramUtil.prototype.currentRootElement = function() {
  return this._canvas.getRootElement().businessObject;
};

DiagramUtil.prototype.currentDiagram = function() {
  const currentRootElement = this.currentRootElement();
  if (currentRootElement) {
    return find(this.diagrams(), function(diagram) {
      return diagram.plane.bpmnElement && diagram.plane.bpmnElement.id === currentRootElement.id;
    });
  }
};

DiagramUtil.prototype.definitions = function() {
  return this._bpmnjs._definitions || [];
};

DiagramUtil.prototype.isCollaboration = function() {
  return this.definitions()?.rootElements?.filter(rootElement => rootElement.$type === 'bpmn:Collaboration').length > 0;
};

DiagramUtil.prototype.diagrams = function() {
  let rootElementProcessIds = this.definitions()?.rootElements?.filter(rootElement => rootElement.$type === 'bpmn:Process').map(rootElement => rootElement.id);
  return this.definitions()?.diagrams?.filter(diagram => rootElementProcessIds.includes(diagram.plane.bpmnElement.id)) || [];
};

DiagramUtil.prototype.removeDiagramById = function(rootElementId) {
  const elementIndex = findIndex(this.definitions().rootElements, function(rootElement) {
    return rootElement.id === rootElementId;
  });

  if (elementIndex >= 0) {
    this.definitions().rootElements.splice(elementIndex, 1);
  } else {
    throw new Error('could not find root element with ID ' + rootElementId);
  }

  const diagramIndex = findIndex(this.definitions().diagrams, function(diagram) {
    return diagram.plane.bpmnElement && diagram.plane.bpmnElement.id === rootElementId;
  });

  if (diagramIndex >= 0) {
    this.definitions().diagrams.splice(diagramIndex, 1);
  } else {
    throw new Error('could not find diagram for ID ' + rootElementId);
  }

  return {
    elementIndex: elementIndex,
    diagramIndex: diagramIndex
  };
};
