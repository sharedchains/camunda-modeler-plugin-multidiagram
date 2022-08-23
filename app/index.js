import $ from 'jquery';
import BpmnModeler from 'bpmn-js/lib/Modeler';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import CamundaModule from 'camunda-bpmn-moddle/lib';

import MultiDiagramFeaturesModule from '../client/bpmn-js-extension/multi-diagram';
import ProcessContextPadModule from '../client/bpmn-js-extension/context-pad';
import CallActivityExtModule from '../client/properties-provider';

import {
  debounce
} from 'min-dash';

import diagramXML from '../resources/newDiagram.bpmn';

import '../styles/app.less';

var container = $('#js-drop-zone');

var bpmnModeler = new BpmnModeler({
  container: '#js-canvas',
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    MultiDiagramFeaturesModule,
    ProcessContextPadModule,
    CallActivityExtModule,
    CamundaPlatformPropertiesProviderModule,
    CamundaModule
  ],
  moddleExtensions: {
    camunda: camundaModdleDescriptor
  }
});

function createNewDiagram() {
  openDiagram(diagramXML);
}

async function openDiagram(xml) {

  try {

    await bpmnModeler.importXML(xml);

    container
      .removeClass('with-error')
      .addClass('with-diagram');
  } catch (err) {

    container
      .removeClass('with-diagram')
      .addClass('with-error');

    container.find('.error pre').text(err.message);

    console.error(err);
  }
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


// //// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(async function() {

    try {

      const { svg } = await bpmnModeler.saveSVG();

      setEncoded(downloadSvgLink, 'diagram.svg', svg);
    } catch (err) {

      console.error('Error happened saving SVG: ', err);

      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {

      const { xml } = await bpmnModeler.saveXML({ format: true });

      setEncoded(downloadLink, 'diagram.bpmn', xml);
    } catch (err) {

      console.error('Error happened saving diagram: ', err);

      setEncoded(downloadLink, 'diagram.bpmn', null);
    }
  }, 500);

  bpmnModeler.on('commandStack.changed', exportArtifacts);




  // HANDLE MULTI-DIAGRAM //////////////////////////////////
  function switchDiagram(e) {
    let id = e.target.value;
    const bpmnjs = bpmnModeler.get('bpmnjs');
    bpmnjs.open(id);
  }

  function addDiagram() {
    let diagramSwitch = bpmnModeler.get('diagramSwitch');
    diagramSwitch.addDiagram();
    populateDiagramCombo();
  }

  function deleteDiagram() {
    let diagramSwitch = bpmnModeler.get('diagramSwitch');
    diagramSwitch.deleteDiagram();
    populateDiagramCombo();
  }

  function renameDiagram(e) {
    let diagramSwitch = bpmnModeler.get('diagramSwitch');
    diagramSwitch.renameDiagram(e.target.value);
    populateDiagramCombo();
  }

  function populateDiagramCombo() {
    let diagramSwitch = bpmnModeler.get('diagramSwitch');
    const select = $('.djs-select');
    select.empty();

    const currentDiagram = diagramSwitch._diagramUtil.currentDiagram();
    const diagrams = diagramSwitch._diagramUtil.diagrams();

    diagrams.forEach((diagram) => {
      const diagramName = diagram.name || diagram.id;
      select.append(`
        <option
          value="${diagram.id}"
          ${currentDiagram.id == diagram.id ? 'selected' : ''}>
            ${diagramName}
        </option>
      `);
    });
  }

  function handleEndRenameEvent(e) {
    if (e.keyCode && e.keyCode !== 13) {
      return;
    }

    displaySelectInterface();
  }

  function displayRenameInterface() {
    hideInterface();

    let diagramSwitch = bpmnModeler.get('diagramSwitch');
    const renameWrapper = document.querySelector('.djs-rename-wrapper');
    renameWrapper.style.display = 'flex';

    const renameInput = document.querySelector('.djs-rename');
    const currentDiagram = diagramSwitch._diagramUtil.currentDiagram();
    renameInput.value = currentDiagram.name || currentDiagram.id;
    renameInput.focus();
    renameInput.select();
  }

  function displaySelectInterface() {
    hideInterface();

    populateDiagramCombo();
    const selectWrapper = document.querySelector('.djs-select-wrapper');
    selectWrapper.style.display = 'flex';
  }

  function hideInterface() {
    const renameWrapper = document.querySelector('.djs-rename-wrapper');
    renameWrapper.style.display = 'none';

    const selectWrapper = document.querySelector('.djs-select-wrapper');
    selectWrapper.style.display = 'none';
  }

  let eventBus = bpmnModeler.get('eventBus');
  eventBus.once('import.render.complete', populateDiagramCombo);

  $('.djs-palette').append(`<div class="djs-select-wrapper">
    <select class="djs-select"></select>
    <button id="start-rename-diagram" class="bpmn-icon-screw-wrench" title="Rename this diagram"></button>
    <button id="delete-diagram" class="bpmn-icon-trash" title="Delete this diagram"></button>
    <button id="add-diagram" class="bpmn-icon-sub-process-marker" title="Add a new diagram"></button>
  </div>

  <div class="djs-rename-wrapper">
    <input class="djs-rename" type="text">
    <button id="end-rename-diagram" class="djs-button">Rename</button>
  </div>
  
<!--  <div class="djs-lcap-activator"><button id="activate-lcap" class="djs-button">LCAP</button>-->`);

  $('.djs-select').on('change', switchDiagram);
  $('#add-diagram').on('click', addDiagram);
  $('#delete-diagram').on('click', deleteDiagram);

  $('#start-rename-diagram').on('click', displayRenameInterface);
  $('.djs-rename').on('change', renameDiagram);
  $('.djs-rename').on('keyup', handleEndRenameEvent);
  $('#end-rename-diagram').on('click', handleEndRenameEvent);
});
