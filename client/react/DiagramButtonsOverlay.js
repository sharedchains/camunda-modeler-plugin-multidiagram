import React from 'camunda-modeler-plugin-helpers/react';
import { Overlay, Section } from 'camunda-modeler-plugin-helpers/components';

const OFFSET = { right: 0 };

import classNames from 'classnames';
import PlusIcon from '../../resources/plus-solid.svg';
import MinusIcon from '../../resources/minus-solid.svg';

// we can even use hooks to render into the application
export default function DiagramButtonsOverlay({ anchor, initValues, onClose, actions }) {

  return (
    <Overlay anchor={anchor} onClose={onClose} offset={OFFSET}>
      <Section>
        <Section.Header>Global subprocesses configuration</Section.Header>
        <Section.Body>
          <div className={classNames('multi-diagram')}>
            <Section.Actions>
              <button
                onClick={actions.addDiagram}
                className={classNames('btn', 'btn-secondary', 'diagram-button', 'add-new-diagram')}>
                <PlusIcon/>
              </button>
            </Section.Actions>
            {initValues?.diagrams?.map((diagram, index) => (
              <div key={index} className={classNames('diagram-entry')}>
                <div
                  onClick={() => actions.switchDiagram(diagram)}
                  className={classNames('btn', initValues.activeDiagram === diagram ? 'btn-primary' : 'btn-secondary', 'diagram-name')}>
                  <span>{diagram}</span>
                </div>
                <button
                  onClick={() => actions.deleteDiagram(diagram)}
                  disabled={initValues.diagrams.length === 1}
                  className={classNames('btn', 'btn-secondary', 'diagram-button', 'remove-diagram')}>
                  <MinusIcon/>
                </button>
              </div>
            ))}
          </div>
        </Section.Body>
      </Section>
    </Overlay>
  );
}