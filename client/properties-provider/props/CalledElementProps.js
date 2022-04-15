import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

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
  const diagramUtil = useService('diagramUtil');

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
      ...diagramUtil.definitions().rootElements
        .filter((rootElement) => rootElement.$type === 'bpmn:Process' && rootElement.id !== diagramUtil.currentRootElement().id)
        .map((rootElement) => {
          return { label: rootElement.id, value: rootElement.id };
        })
    ];
  };

  // const validate = (value) => {
  //   const businessObject = getBusinessObject(element);
  //   return
  // };
  // return <SelectEntry
  //   id={id}
  //   element={element}
  //   description={translate('Called inner element reference')}
  //   label={translate('Called Element')}
  //   getValue={getValue}
  //   setValue={setValue}
  //   getOptions={getOptions}
  //   debounce={debounce}
  // />;

  return SelectEntry({
    element,
    id,
    label: translate('Called inner element reference'),
    getValue,
    setValue,
    getOptions,
    debounce
  });
}