import {
  registerBpmnJSPlugin
} from 'camunda-modeler-plugin-helpers';

import CallActivityExt from './properties-panel-ext/CallActivityExt';
import ProcessContextPad from './properties-panel-ext';

registerBpmnJSPlugin(CallActivityExt);
registerBpmnJSPlugin(ProcessContextPad);
