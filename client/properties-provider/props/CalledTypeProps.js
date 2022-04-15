import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default function(element) {
  return [
    {
      id: 'callableElementTypeRef',
      element,
      component: CalledElementType,
      isEdited: isSelectEntryEdited
    }
  ];
}

function getCalledElementType(element) {
  const bo = getBusinessObject(element);
  const boCalledElement = bo.get('calledElement');

  let calledElementType = 'external';
  if (typeof boCalledElement !== 'undefined' &&
    boCalledElement.startsWith('inner:')) {
    calledElementType = 'internal';
  }

  return calledElementType;
}

function CalledElementType(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getCalledElementType(element);
  };

  const setValue = value => {
    let calledElement;
    if (value === 'internal') {
      calledElement = 'inner:';
    } else if (value === 'external') {
      calledElement = '';
    }
    return modeling.updateProperties(element, {
      calledElement: calledElement
    });
  };

  const getOptions = () => {
    return [
      { label: 'INTERNAL', value: 'internal' },
      { label: 'EXTERNAL', value: 'external' }
    ];
  };

  // return <SelectEntry
  //   id={id}
  //   element={element}
  //   description={translate('Called element is a global (internal) subprocess or an external BPMN')}
  //   label={translate('Called Element Type')}
  //   getValue={getValue}
  //   setValue={setValue}
  //   getOptions={getOptions}
  //   debounce={debounce}
  // />;
  return SelectEntry({
    element,
    id,
    label: translate('Called Element Type'),
    getValue,
    setValue,
    getOptions,
    debounce
  });
}