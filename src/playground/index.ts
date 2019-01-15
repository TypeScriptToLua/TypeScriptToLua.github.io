import '../../assets/styles/play.scss';

import {editor} from 'monaco-editor/esm/vs/editor/editor.api';

// @ts-ignore
import TSTLWorker = require('worker-loader?name=tstl.worker.js!./tstlWorker');

// @ts-ignore
import FengariWorker = require('worker-loader?name=fengari.worker.js!./fengariWorker');

import * as tstl from 'typescript-to-lua/dist/LuaAST';

const renderjson = require("renderjson");

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('editor-ts');
  const output = document.getElementById('editor-output-content');
  const exampleLua = document.getElementById('editor-lua');
  const astLua = document.getElementById('editor-lua-ast');


  // Layout stuff
  const luaTabText = document.getElementById("lua-tab-text") as HTMLDivElement | null;
  const luaTabAst = document.getElementById("lua-tab-ast") as HTMLDivElement | null;
  if (luaTabText && luaTabAst && exampleLua && astLua) {
    const tabOnclick = () => {
      luaTabText.classList.toggle("lua-tab-active");
      luaTabAst.classList.toggle("lua-tab-active");
      exampleLua.classList.toggle("editor-lua-active");
      astLua.classList.toggle("editor-lua-active");
    };
    luaTabText.onclick = tabOnclick;
    luaTabAst.onclick = tabOnclick;
  }


  // Actual editor and transpilation
  let example = `// Declare exposed API
type Vector = [number, number, number];

declare interface OnSpellStartEvent {
    caster: Unit;
    targetLocation: Vector;
}

declare class Unit {
    getLevel(): number;
    isEnemy(other: Unit): boolean;
    kill(): void;
}

declare function print(...messages: any[]): void;
declare function FindUnitsInRadius(location: Vector, radius: number): Unit[];

// Use declared API in code
function onSpellStart(event: OnSpellStartEvent): void {
    const units = FindUnitsInRadius(event.targetLocation, 500);
    const enemies = units.filter(unit => event.caster.isEnemy(unit));

    for (const unit of enemies) {
        print(unit, unit.getLevel());
        unit.kill();
    }
}`;
  
  var queryStringSrcStart = window.location.hash.indexOf("#src=");
  if (queryStringSrcStart == 0) {
    var encoded = window.location.hash.substring("#src=".length);
    example = decodeURIComponent(encoded);
  }

  if (container && exampleLua && astLua) {
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
    let ignoreHashChange = false;

    tsEditor.onDidChangeModelContent((e => {
      clearInterval(timerVar);
      // wait one second before submitting work
      timerVar = setTimeout(() => {
        tstlWorker.postMessage({tsStr: tsEditor.getValue()});
        window.location.replace("#src=" + encodeURIComponent(tsEditor.getValue()));
        ignoreHashChange = true;
      }, 500);      
    }))

    window.onhashchange = () => {
      if (ignoreHashChange) {
        ignoreHashChange = false;
        return;
      }
    }

    const fengariWorker = new (FengariWorker as any)();

    tstlWorker.onmessage = (event: MessageEvent) => {
      luaEditor.setValue(event.data.luaStr);
      console.log(event.data.luaAST);
      astLua.appendChild(
        renderjson
          .set_show_to_level(1)
          .set_replacer((name: string, val: any) => {
            if (name === "kind") {
              return tstl.SyntaxKind[val];
            }
            return val;
          })(event.data.luaAST));
      fengariWorker.postMessage({luaStr: event.data.luaStr});
    }

    fengariWorker.onmessage = (event: MessageEvent) => {
      if (output) {
        output.innerText = event.data.luaPrint;
      }
    }
  }
});