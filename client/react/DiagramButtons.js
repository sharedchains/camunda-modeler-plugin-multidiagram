import React, { Fragment, PureComponent, Component } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';
import DropdownButton from './DropdownButton';
import Button from './Button';

import RenameDiagramModal from './modals/rename-diagram/RenameDiagramModal';

import classNames from 'classnames';
import { find } from 'lodash';

const defaultState = {
    modeler: null,
    tabModeler: [],
    activeDiagram: null,
    multi: false,
    renameDiagramModalOpen: false
};

export default class DiagramButtons extends PureComponent {

    constructor(props) {
        super(props);

        this.state = defaultState;
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
            subscribe
        } = this.props;

        subscribe('bpmn.modeler.created', ({ modeler, tab }) => {
            const { tabModeler }
                = this.state;
            this.setState({
                modeler: modeler,
                tabModeler: [...tabModeler, { tabId: tab.id, modeler: modeler }]
            });

            const eventBus = modeler.get('eventBus');
            const diagramUtil = modeler.get('diagramUtil');
            eventBus.on('import.done', () => {
                let bpmnjs = modeler.get('bpmnjs');
                let isMultiDiagram = bpmnjs._definitions && bpmnjs._definitions.diagrams.length > 1;
                this.setState({ activeDiagram: diagramUtil.currentDiagram(), multi: isMultiDiagram });
            });

            eventBus.on('commandStack.diagram.create.execute', (command) =>
                this.setState({ activeDiagram: command.context.newDiagram })
            );

            eventBus.on('commandStack.diagram.delete.execute', () =>
                this.setState({ activeDiagram: diagramUtil.currentDiagram() })
            );

        });

        subscribe('app.activeTabChanged', (tab) => {
            const {
                tabModeler
            } = this.state;
            let activeTabId = tab.activeTab.id;
            const activeModeler = find(tabModeler, { tabId: activeTabId });
            if (activeModeler) {
                let bpmnjs = activeModeler.modeler.get('bpmnjs');
                let isMultiDiagram = bpmnjs._definitions && bpmnjs._definitions.diagrams.length > 1;
                this.setState({ modeler: activeModeler.modeler, multi: isMultiDiagram});
            } else {
                this.setState(defaultState);
            }
        });

    }

    componentDidUpdate() {
    }

    getDiagrams = () => {
        const { modeler } = this.state;
        const bpmnjs = modeler.get('bpmnjs');
        let definitions = bpmnjs._definitions;
        if (!!definitions) {
            return definitions.diagrams.map((diagram, index) => {
                const { id } = diagram;

                return (
                    <Diagram
                        id={id}
                        key={index}
                        onClick={() => {
                            bpmnjs.open(id);
                            this.handleSwitch();
                        }}
                        className="item"
                    />
                );
            });
        }
        return [];
    }

    addDiagram = () => {
        const { modeler } = this.state;
        const commandStack = modeler.get('commandStack');
        commandStack.execute('diagram.create', {});
        this.setState({ multi: true });
    }

    deleteDiagram = () => {
        const { modeler } = this.state;
        let definitions = modeler.getDefinitions();

        if (definitions && definitions.diagrams.length > 1) {
            this.setState({ multi: (definitions.diagrams.length - 1) > 1 });
            const commandStack = modeler.get('commandStack');
            commandStack.execute('diagram.delete', {});
        }
    }

    handleRenameDiagram = (newNameObject) => {
        const { modeler } = this.state;
        const commandStack = modeler.get('commandStack');
        commandStack.execute('diagram.rename', { newName: newNameObject.activeDiagram });
        this.setState({ renameDiagramModalOpen: false });
    }

    handleSwitch = () => {
        const { modeler } = this.state;
        const diagramUtil = modeler.get('diagramUtil');

        this.setState({ activeDiagram: diagramUtil.currentDiagram() });
    }

    closeModal = () => {
        this.setState({ renameDiagramModalOpen: false });
    }

    /**
       * render any React component you like to extend the existing
       * Camunda Modeler application UI
       */
    render() {
        const { activeDiagram }
            = this.state;
        const initValues = { activeDiagram: (activeDiagram ? activeDiagram.id : undefined) };
        // we can use fills to hook React components into certain places of the UI
        return <Fragment>
            <Fill slot="toolbar" group="9_multidiagram">
                <Button
                    onClick={() => {
                        if (this.state.modeler)
                            this.addDiagram();
                    }}
                    disabled={!this.state.modeler}
                    title="New Diagram"
                    className={classNames('toolbarBtn')}
                >
                    <span className={classNames("app-icon-multidiagram-new")}></span>
                </Button>
                <Button
                    onClick={() => {
                        if (this.state.modeler)
                            this.deleteDiagram();
                    }}
                    disabled={!this.state.modeler || !this.state.multi}
                    title="Delete Diagram"
                    className={classNames('toolbarBtn')}
                >
                    <span className={classNames("app-icon-multidiagram-delete")}></span>
                </Button>
                <Button
                    onClick={() => {
                        if (this.state.modeler)
                            this.setState({ renameDiagramModalOpen: true });
                    }}
                    disabled={!this.state.modeler}
                    title="Rename diagram"
                    className={classNames('toolbarBtn')}
                >
                    <span className={classNames("app-icon-multidiagram-rename")}></span>
                </Button>
                <DropdownButton
                    title="Switch diagram"
                    disabled={!this.state.modeler}
                    items={this.getDiagrams}
                    className={classNames('dropdownBtn')}
                >
                    <span className={classNames("app-icon-new")}></span>
                </DropdownButton>
            </Fill>
            {this.state.modeler && this.state.renameDiagramModalOpen && (
                <RenameDiagramModal
                    onClose={this.closeModal}
                    onRename={this.handleRenameDiagram}
                    initValues={initValues}
                />
            )}
        </Fragment>;
    }
}

class Diagram extends Component {
    render() {
        const { id, onClick, className } = this.props;

        return (<div onClick={onClick} id={id} className={className}>&nbsp;{ id}&nbsp;</div>);
    }
}