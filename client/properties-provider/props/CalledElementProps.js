import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';
import { find } from 'lodash';

export default function(element) {
  return [
    {
      id: 'callableInnerElementRef',
      element,
      component: CalledElementRef,
      isEdited: isSelectEntryEdited
    }
  ];
}

function CalledElementRef(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const eventBus = useService('eventBus');
  const diagramUtil = useService('diagramUtil');

  const [ diagrams, setDiagrams ] = useState([]);
  const [ rootElements, setRootElements ] = useState([]);
  const [ currentRootElement, setCurrentRootElement ] = useState(null);

  useEffect(() => {
    eventBus.on('import.done', function() {
      setDiagrams(diagramUtil.diagrams());
      setRootElements(diagramUtil.definitions().rootElements);
      setCurrentRootElement(diagramUtil.currentRootElement().id);
    });
  }, [ diagrams, rootElements, currentRootElement ]);

  useEffect(() => {
    eventBus.on('diagram.switch', function(event) {
      const diagram = find(diagramUtil.diagrams(), { id: event.diagram.id });
      setCurrentRootElement(diagram.plane.bpmnElement.id);
    });
    eventBus.on('commandStack.diagram.create.executed', function(context) {
      setCurrentRootElement(context.context.newProcess.id);
    });
  }, [ currentRootElement ]);

  const getValue = () => {
    return element.businessObject.calledElement.replace(/^(inner:)/, '') || '';
  };

  const setValue = value => {
    return modeling.updateProperties(element, {
      calledElement: 'inner:' + value || 'inner:'
    });
  };

  const getOptions = () => {
    return [
      ...rootElements
        .filter((rootElement) => rootElement.id !== currentRootElement)
        .map((rootElement) => {
          return { label: rootElement.id, value: rootElement.id };
        })
    ];
  };

  // const validate = (value) => {
  //   const businessObject = getBusinessObject(element);
  //   return
  // };

  return <SelectEntry
    id={id}
    element={element}
    description={translate('Called inner element reference')}
    label={translate('Called Element')}
    getValue={getValue}
    setValue={setValue}
    getOptions={getOptions}
    debounce={debounce}
  />;
}