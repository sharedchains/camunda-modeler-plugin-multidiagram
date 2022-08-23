/**
 * Handler which creates a new diagram in the same bpmn file.
 */
export default function CreateDiagramHandler(bpmnjs, bpmnFactory, diagramUtil, commandStack) {

  this._bpmnjs = bpmnjs;
  this._bpmnFactory = bpmnFactory;
  this._diagramUtil = diagramUtil;
  this._commandStack = commandStack;
}

CreateDiagramHandler.$inject = [
  'bpmnjs',
  'bpmnFactory',
  'diagramUtil',
  'commandStack'
];

CreateDiagramHandler.prototype.createProcess = function() {
  const process = this._bpmnFactory.create('bpmn:Process', {});
  process.$parent = this._diagramUtil.definitions();
  return process;
};

CreateDiagramHandler.prototype.createDiagram = function(rootElement) {
  const plane = this._bpmnFactory.createDiPlane(rootElement);
  const diagram = this._bpmnFactory.create('bpmndi:BPMNDiagram', {
    plane: plane
  });
  plane.$parent = diagram;
  diagram.$parent = this._diagramUtil.definitions();
  return diagram;
};

CreateDiagramHandler.prototype.preExecute = function(context) {

  context.oldDiagramId = this._diagramUtil.currentDiagram().id;

  // create new semantic objects
  const newProcess = this.createProcess();
  const newDiagram = this.createDiagram(newProcess);

  // store them in the context
  context.newProcess = newProcess;
  context.newDiagram = newDiagram;
};

CreateDiagramHandler.prototype.execute = function(context) {
  this._diagramUtil.definitions().rootElements.push(context.newProcess);
  this._bpmnjs._definitions.diagrams.push(context.newDiagram);

  this._bpmnjs.open(context.newDiagram.id);
};

CreateDiagramHandler.prototype.revert = function(context) {
  this._diagramUtil.removeDiagramById(context.newProcess.id);
  this._bpmnjs.open(context.oldDiagramId);
};
