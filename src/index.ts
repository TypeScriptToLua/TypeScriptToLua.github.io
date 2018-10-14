import './assets/styles/main.scss';

import {editor} from 'monaco-editor/esm/vs/editor/editor.api';

import TSTLWorker = require('worker-loader!./tstlWorker');

import * as URL from "url-parse";

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('example-ts');
  const exampleLua = document.getElementById('example-lua');

  let example = `class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
  }
  
  let greeter = new Greeter("world");
  
  let button = document.createElement('button');
  button.textContent = "Say Hello";
  button.onclick = function() {
    alert(greeter.greet());
  }
  
  document.body.appendChild(button);
  `;
  
  let windowUrl = new URL(window.location.href, window.location, true);
  if (windowUrl.query.src) {
    example = decodeURIComponent(windowUrl.query.src);
  }

  if (container && exampleLua) {
    let tsEditor = editor.create(container, {
      value: example,
      language: 'typescript',
      minimap: {enabled: false},
      theme: 'vs-dark',
    });

    let luaEditor = editor.create(exampleLua, {
      value: '',
      language: 'lua',
      minimap: {enabled: false},
      theme: 'vs-dark',
      readOnly: true
    });

    window.onresize = () => {
      tsEditor.layout();
      luaEditor.layout();
    }

    const tstlWorker = new (TSTLWorker as any)();
    tstlWorker.postMessage({tsStr: tsEditor.getValue()});

    let timerVar: any;

    tsEditor.onDidChangeModelContent((e => {
      clearInterval(timerVar);
      // wait one second before submitting work
      timerVar = setTimeout(() => {
        tstlWorker.postMessage({tsStr: tsEditor.getValue()});
        window.location.replace("?src=" + encodeURIComponent(tsEditor.getValue()));
      }, 500);      
    }))

    tstlWorker.onmessage = (event: MessageEvent) => {
      luaEditor.setValue(event.data.luaStr);
    }
  }
});