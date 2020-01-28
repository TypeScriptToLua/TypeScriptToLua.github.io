import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/lua/lua.contribution";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";
import "monaco-editor/esm/vs/editor/edcore.main";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import renderjson from "renderjson";
import * as lua from "typescript-to-lua/dist/LuaAST";
import { version as tstlVersion } from "typescript-to-lua/package.json";
import EditorWorker from "worker-loader?name=editor.worker.js!monaco-editor/esm/vs/editor/editor.worker.js";
import FengariWorker from "worker-loader?name=fengari.worker.js!./fengari.worker";
import TsWorker from "worker-loader?name=ts.worker.js!./ts.worker";
import "../../assets/styles/play.scss";

// TODO: Use TypeScript 3.8 type imports
type CustomTypeScriptWorker = import("./ts.worker").CustomTypeScriptWorker;

(globalThis as any).MonacoEnvironment = {
    getWorker(_workerId: any, label: string) {
        if (label === "typescript") {
            return new TsWorker();
        }

        return new EditorWorker();
    },
};

const container = document.getElementById("editor-ts");
const outputTerminalHeader = document.getElementById("editor-output-terminal-header");
const outputTerminalContent = document.getElementById("editor-output-terminal-content");
const exampleLua = document.getElementById("editor-lua");
const astLua = document.getElementById("editor-lua-ast");

// Set tstl version
outputTerminalHeader!.textContent = `TypescriptToLua version ${tstlVersion}`;

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
let example = `/** @noSelfInFile */

// Declare exposed API
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
    renderjson.set_show_to_level(1);
    renderjson.set_replacer((key: string, value: any) => {
        if (key === "kind") {
            return lua.SyntaxKind[value];
        }

        return value;
    });

    async function compileLua() {
        const model = tsEditor.getModel()!;
        const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
        const client = (await getWorker(model.uri)) as CustomTypeScriptWorker;
        const { code, ast } = await client.getTranspileOutput();

        luaEditor.setValue(code);
        astLua!.innerText = "";
        astLua!.appendChild(renderjson(ast));
        fengariWorker.postMessage({ luaStr: code });
    }

    let tsEditor = monaco.editor.create(container, {
        value: example,
        language: "typescript",
        minimap: { enabled: false },
        theme: "vs-dark",
    });

    let luaEditor = monaco.editor.create(exampleLua, {
        value: "",
        language: "lua",
        minimap: { enabled: false },
        theme: "vs-dark",
        readOnly: true,
    });

    window.onresize = () => {
        tsEditor.layout();
        luaEditor.layout();
    };

    compileLua();

    let timerVar: any;
    let ignoreHashChange = false;

    tsEditor.onDidChangeModelContent(e => {
        clearInterval(timerVar);
        // Update transpile result only once per 250s
        timerVar = setTimeout(() => {
            compileLua();
            window.location.replace("#src=" + encodeURIComponent(tsEditor.getValue()));
            ignoreHashChange = true;
        }, 250);
    });

    window.onhashchange = () => {
        if (ignoreHashChange) {
            ignoreHashChange = false;
            return;
        }
    };

    const fengariWorker = new FengariWorker();
    fengariWorker.onmessage = (event: MessageEvent) => {
        if (outputTerminalContent) {
            outputTerminalContent.innerText = event.data.luaPrint;
        }
    };
}
