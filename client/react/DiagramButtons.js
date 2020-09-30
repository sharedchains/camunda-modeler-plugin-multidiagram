import React, { Fragment, PureComponent, Component } from 'camunda-modeler-plugin-helpers/react';
import { Fill } from 'camunda-modeler-plugin-helpers/components';
import DropdownButton from './DropdownButton';
import Button from './Button';

import RenameDiagramModal from './modals/rename-diagram/RenameDiagramModal';

import classNames from 'classnames';

const defaultState = {
    modeler: { getDefinitions: () => undefined },
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

        subscribe('bpmn.modeler.created', ({ modeler }) => {
            this.modeler = modeler;

            // const setState = this.setState;
            const eventBus = modeler.get('eventBus');
            const diagramUtil = modeler.get('diagramUtil');
            eventBus.on('import.done', () => {
                this.setState({ activeDiagram: diagramUtil.currentDiagram() });
            });

            eventBus.on('commandStack.diagram.create.execute', (command) => 
                this.setState({ activeDiagram: command.context.newDiagram })
            );
            
            eventBus.on('commandStack.diagram.delete.execute', () => 
                this.setState({ activeDiagram: diagramUtil.currentDiagram() })
            );
        });
    }

    componentDidUpdate() {
    }

    getModeler = () => {
        return this.modeler || defaultState.modeler;
    }

    getDiagrams = () => {
        const modeler = this.getModeler();
        let definitions = modeler.getDefinitions();
        const bpmnjs = modeler.get('bpmnjs');
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
        const modeler = this.getModeler();
        const commandStack = modeler.get('commandStack');
        commandStack.execute('diagram.create', {});
        this.setState({ multi: true });
    }

    deleteDiagram = () => {
        const modeler = this.getModeler();
        let definitions = modeler.getDefinitions();

        if (definitions && definitions.diagrams.length > 1) {
            this.setState({ multi: (definitions.diagrams.length - 1) > 1 });
            const commandStack = modeler.get('commandStack');
            commandStack.execute('diagram.delete', {});
        }
    }

    handleRenameDiagram = (newNameObject) => {
        const modeler = this.getModeler();
        const commandStack = modeler.get('commandStack');
        commandStack.execute('diagram.rename', { newName: newNameObject.activeDiagram });
        this.setState({ renameDiagramModalOpen: false });
    }

    handleSwitch = () => {
        const modeler = this.getModeler();
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
        const initValues = { activeDiagram : (activeDiagram ? activeDiagram.id: undefined) };
        // we can use fills to hook React components into certain places of the UI
        return <Fragment>
            <Fill slot="toolbar" group="9_multidiagram">
                <Button
                    onClick={() => this.addDiagram()}
                    title="New Diagram"
                    className={classNames('toolbarBtn')}
                >
                    <span className={classNames("app-icon-multidiagram-new")}></span>
                </Button>
                <Button
                    onClick={() => this.deleteDiagram()}
                    disabled={!this.state.multi}
                    title="Delete Diagram"
                    className={classNames('toolbarBtn')}
                >
                    <span className={classNames("app-icon-multidiagram-delete")}></span>
                </Button>
                <Button
                    onClick={() => this.setState({ renameDiagramModalOpen: true })}
                    title="Rename diagram"
                    className={classNames('toolbarBtn')}
                >
                    <span className={classNames("app-icon-multidiagram-rename")}></span>
                </Button>
                <DropdownButton
                    title="Switch diagram"
                    items={this.getDiagrams}
                    className={classNames('dropdownBtn')}
                >
                    <span className={classNames("app-icon-new")}></span>
                </DropdownButton>
            </Fill>
            {this.state.renameDiagramModalOpen && (
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