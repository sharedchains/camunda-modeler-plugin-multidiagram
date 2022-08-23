/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'camunda-modeler-plugin-helpers/react';
import { Modal } from 'camunda-modeler-plugin-helpers/components';

// polyfill upcoming structural components
const Title = Modal.Title || (({ children }) => <h2>{ children }</h2>);
const Body = Modal.Body || (({ children }) => <div>{ children }</div>);
const Footer = Modal.Footer || (({ children }) => <div>{ children }</div>);

export default function RenameDiagramModal({ initValues, onRename, onClose }) {

  const [ activeDiagram, setActiveDiagram ] = useState(initValues.activeDiagram);
  const onSubmit = () => onRename({ activeDiagram });

  return <Modal onClose={ onClose }>
    <Title>Rename current diagram</Title>

    <Body>
      <form id="renameDiagramConfigForm" onSubmit={ onSubmit }>
        <p>
          <label>
            New diagram name:&nbsp;
            <input
              type="text"
              name="activeDiagram"
              value={ activeDiagram }
              onChange={ event => setActiveDiagram(event.target.value) }
            />
          </label>
        </p>
      </form>
    </Body>
    <Footer>
      <div id="renameDiagramConfigButtons">
        <button type="submit" className="btn btn-primary" form="renameDiagramConfigForm">Save</button>
        <button type="button" className="btn btn-secondary" onClick={ () => onClose() }>Cancel</button>
      </div>
    </Footer>
  </Modal>;
}
