import {
  registerBpmnJSPlugin,
  registerClientExtension
} from 'camunda-modeler-plugin-helpers';

import MultiDiagramButton from './react/MultiDiagramButton';

import MultiDiagramFeatures from './bpmn-js-extension/multi-diagram';
import ProcessContextPad from './bpmn-js-extension/context-pad';
import CallActivityExt from './properties-provider';

registerBpmnJSPlugin(MultiDiagramFeatures);
registerBpmnJSPlugin(ProcessContextPad);
registerBpmnJSPlugin(CallActivityExt);

registerClientExtension(MultiDiagramButton);