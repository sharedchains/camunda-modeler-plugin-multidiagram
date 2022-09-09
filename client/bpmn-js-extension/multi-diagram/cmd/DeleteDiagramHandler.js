import { find } from 'min-dash';

/**
 * Handler which deletes the currently displayed diagram.
 */
export default function DeleteDiagramHandler(bpmnjs, commandStack, diagramUtil) {
  this._bpmnjs = bpmnjs;
  this._commandStack = commandStack;
  this._diagramUtil = diagramUtil;
}

DeleteDiagramHandler.$inject = [
  'bpmnjs',
  'commandStack',
  'diagramUtil'
];

// eslint-disable-next-line no-unused-vars
DeleteDiagramHandler.prototype.canExecute = function(_context) {
  return this._diagramUtil.diagrams().length > 1;
};

DeleteDiagramHandler.prototype.preExecute = function(context) {
  const diagrams = this._diagramUtil.diagrams();
  if (context.diagram) {
    const diagramToRemove = find(diagrams, diagram => diagram.id === context.diagram);
    context.removedProcess = { ...diagramToRemove.plane.bpmnElement };
    context.removedDiagram = diagramToRemove;
  } else {
    context.removedProcess = this._diagramUtil.currentRootElement();
    context.removedDiagram = this._diagramUtil.currentDiagram();
  }

  // switch to the first diagram in the list that is not to be deleted
  const otherDiagramId = find(diagrams, function(diagram) {
    return (diagram.id !== context.diagram);
  }).id;
  this._bpmnjs.open(otherDiagramId);
};

DeleteDiagramHandler.prototype.execute = function(context) {
  context.indices = this._diagramUtil.removeDiagramById(context.removedProcess.id);
};

DeleteDiagramHandler.prototype.revert = function(context) {

  // reinsert the rootElement and diagram
  this._bpmnjs._definitions.diagrams.push(context.removedDiagram);
  this._bpmnjs._definitions.rootElements.push(context.removedProcess);
};
