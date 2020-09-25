import {
  registerClientExtension,
  registerBpmnJSPlugin
} from 'camunda-modeler-plugin-helpers';

import DiagramButtons from './react/DiagramButtons';

import MultiDiagramFeatures from './bpmn-js-extension/multi-diagram';
import ProcessContextPad from './bpmn-js-extension/context-pad';
import CallActivityExt from './properties-provider';

registerBpmnJSPlugin(MultiDiagramFeatures);
registerBpmnJSPlugin(CallActivityExt);
registerBpmnJSPlugin(ProcessContextPad);

registerClientExtension(DiagramButtons);