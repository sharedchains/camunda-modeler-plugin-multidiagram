import CallActivityExt from './CallActivityExt';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 *
 */
export default {
  __init__: [ 'CallableProcessProvider' ],
  CallableProcessProvider: [ 'type', CallActivityExt ]
};
