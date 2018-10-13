import './assets/styles/main.scss';

import {editor} from 'monaco-editor/esm/vs/editor/editor.api';

import TSTLWorker = require('worker-loader!./tstlWorker');

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('example-ts');
  const exampleLua = document.getElementById('example-lua');

  if (container && exampleLua) {
    let tsEditor = editor.create(container, {
      value: 'class Test {};',
      language: 'typescript',
      minimap: {enabled: false},
      theme: 'vs-dark',
    });

    let luaEditor = editor.create(exampleLua, {
      value: '',
      language: 'lua',
      minimap: {enabled: false},
      theme: 'vs-dark',
    });

    window.onresize = () => {
      tsEditor.layout();
      luaEditor.layout();
    }

    const tstlWorker = new (TSTLWorker as any)();

    let timerVar: NodeJS.Timeout;

    tsEditor.onDidChangeModelContent((e => {
      clearInterval(timerVar);
      // wait one second before submitting work
      timerVar = setTimeout(() => tstlWorker.postMessage({tsStr: tsEditor.getValue()}), 1000);      
    }))

    tstlWorker.onmessage = (event: MessageEvent) => {
      luaEditor.setValue(event.data.luaStr);
    }
  }
});