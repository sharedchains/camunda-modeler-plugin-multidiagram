import React, { Fragment, PureComponent } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';

import SubProcessIcon from '../../resources/subprocess-collapsed.svg';

import classNames from 'classnames';
import { find } from 'min-dash';
import DiagramButtonsOverlay from './DiagramButtonsOverlay';

const defaultState = {
  modeler: null,
  tabModeler: [],
  activeDiagram: null,
  multi: false,
  configOpen: false
};

export default class MultiDiagramButton extends PureComponent {

  constructor(props) {
    super(props);

    this.state = defaultState;

    this._multiDiagramButtonRef = React.createRef();

    this.handleConfigClosed = this.handleConfigClosed.bind(this);
  }

  componentDidMount() {

    /**
     * The component props include everything the Application offers plugins,
     * which includes:
     * - config: save and retrieve information to the local configuration
     * - subscribe: hook into application events, like <tab.saved>, <app.activeTabChanged> ...
     * - triggerAction: execute editor actions, like <save>, <open-diagram> ...
     * - log: log information into the Log panel
     * - displayNotification: show notifications inside the application
     */
    const {
      // eslint-disable-next-line react/prop-types
      subscribe
    } = this.props;

    subscribe('bpmn.modeler.created', ({ modeler, tab }) => {
      const { tabModeler } = this.state;
      this.setState({
        modeler: modeler,
        tabModeler: [ ...tabModeler, { tabId: tab.id, modeler: modeler } ]
      });

      const eventBus = modeler.get('eventBus');
      const diagramUtil = modeler.get('diagramUtil');
      eventBus.on('import.done', () => {
        let bpmnjs = modeler.get('bpmnjs');
        let isMultiDiagram = bpmnjs._definitions && diagramUtil.diagrams.length > 1;
        this.setState({ activeDiagram: diagramUtil.currentDiagram(), multi: isMultiDiagram });
      });

      eventBus.on('commandStack.diagram.create.execute', (command) =>
        this.setState({ activeDiagram: command.context.newDiagram })
      );

      eventBus.on('commandStack.diagram.delete.execute', () =>
        this.setState({ activeDiagram: diagramUtil.currentDiagram() })
      );

      eventBus.on('diagram.switch', () => {
        this.setState({ activeDiagram: diagramUtil.currentDiagram() });
      });

    });

    subscribe('app.activeTabChanged', (tab) => {
      const {
        tabModeler
      } = this.state;
      let activeTabId = tab.activeTab.id;
      const activeModeler = find(tabModeler, (tab) => tab.tabId === activeTabId);
      if (activeModeler) {
        let bpmnjs = activeModeler.modeler.get('bpmnjs');
        let diagramUtil = activeModeler.modeler.get('diagramUtil');
        let isMultiDiagram = bpmnjs._definitions && diagramUtil.diagrams.length > 1;
        this.setState({
          modeler: activeModeler.modeler,
          multi: isMultiDiagram,
          activeDiagram: diagramUtil.currentDiagram()
        });
      } else {
        this.setState(defaultState);
      }
    });

  }

  addDiagram = () => {
    const { modeler } = this.state;
    const commandStack = modeler.get('commandStack');
    commandStack.execute('diagram.create', {});
    this.setState({ multi: true });
  };

  deleteDiagram = () => {
    const { modeler } = this.state;
    const diagramUtil = modeler.get('diagramUtil');

    if (diagramUtil.diagrams().length > 1) {
      this.setState({ multi: (diagramUtil.diagrams().length - 1) > 1 });
      const commandStack = modeler.get('commandStack');
      commandStack.execute('diagram.delete', {});
    }
  };

  switchDiagram = (diagramId) => {
    const { modeler } = this.state;
    const eventBus = modeler.get('eventBus');

    eventBus.fire('diagram.switch', { diagram: { id: diagramId } });
  };

  handleConfigClosed = () => {
    this.setState({ configOpen: false });
  };

  /**
   * render any React component you like to extend the existing
   * Camunda Modeler application UI
   */
  render() {
    const { configOpen, activeDiagram, modeler } = this.state;
    let initValues = {};
    if (modeler) {

      const diagramUtil = modeler.get('diagramUtil');
      initValues = { activeDiagram: (activeDiagram ? activeDiagram.id : undefined), diagrams: diagramUtil.diagrams() };
    }

    // we can use fills to hook React components into certain places of the UI
    return <Fragment>
      <Fill slot="status-bar__app" group="1_multidiagram">
        <button
          ref={this._multiDiagramButtonRef}
          onClick={() => this.setState({ configOpen: true })}
          className={classNames('btn', { 'btn--active': configOpen })}
        >
          <SubProcessIcon/>
        </button>
      </Fill>
      {
        this.state.configOpen && (
          <DiagramButtonsOverlay
            anchor={this._multiDiagramButtonRef.current}
            onClose={this.handleConfigClosed}
            initValues={initValues}
            actions={{
              addDiagram: this.addDiagram,
              deleteDiagram: this.deleteDiagram,
              switchDiagram: this.switchDiagram
            }}/>
        )
      }
    </Fragment>;
  }
}