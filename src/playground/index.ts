import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/lua/lua.contribution";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";
import "monaco-editor/esm/vs/editor/edcore.main";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import renderjson from "renderjson";
import { version as tstlVersion } from "typescript-to-lua/package.json";
import EditorWorker from "worker-loader?name=editor.worker.js!monaco-editor/esm/vs/editor/editor.worker.js";
import FengariWorker from "worker-loader?name=fengari.worker.js!./fengari.worker";
import TsWorker from "worker-loader?name=ts.worker.js!./ts.worker";
import "../../assets/styles/play.scss";
import { getInitialCode, updateCodeHistory } from "./code";

// TODO: Use TypeScript 3.8 type imports
type CustomTypeScriptWorker = import("./ts.worker").CustomTypeScriptWorker;
type LuaBlock = import("typescript-to-lua/dist/LuaAST").Block;
type LuaMessage = import("./fengari.worker").LuaMessage;

(globalThis as any).MonacoEnvironment = {
    getWorker(_workerId: any, label: string) {
        if (label === "typescript") {
            return new TsWorker();
        }

        return new EditorWorker();
    },
};

const LuaSyntaxKind = __LUA_SYNTAX_KIND__;
renderjson.set_show_to_level(1);
renderjson.set_replacer((key: string, value: any) => {
    if (key === "kind") {
        return LuaSyntaxKind[value];
    }

    return value;
});

const tsEditorContainer = document.getElementById("editor-ts")!;
const luaEditorContainer = document.getElementById("editor-lua")!;
const luaAstContainer = document.getElementById("editor-lua-ast")!;
const outputTerminalContent = document.getElementById("editor-output-terminal-content")!;

// Set tstl version
const outputTerminalHeader = document.getElementById("editor-output-terminal-header")!;
outputTerminalHeader.textContent = `TypeScriptToLua version ${tstlVersion}`;

// Layout stuff
const luaTabText = document.querySelector<HTMLDivElement>("#lua-tab-text")!;
const luaTabAst = document.querySelector<HTMLDivElement>("#lua-tab-ast")!;
const onTabClick = () => {
    luaTabText.classList.toggle("lua-tab-active");
    luaTabAst.classList.toggle("lua-tab-active");
    luaEditorContainer.classList.toggle("editor-lua-active");
    luaAstContainer.classList.toggle("editor-lua-active");
};

luaTabText.onclick = onTabClick;
luaTabAst.onclick = onTabClick;

function setLuaAST(ast: LuaBlock) {
    luaAstContainer.innerText = "";
    luaAstContainer.appendChild(renderjson(ast));
}

async function onCodeChanged() {
    const model = tsEditor.getModel()!;
    const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
    const client: CustomTypeScriptWorker = await getWorker(model.uri);

    const { code, ast } = await client.getTranspileOutput(model.uri.toString());
    luaEditor.setValue(code);
    setLuaAST(ast);
    fengariWorker.postMessage({ code });
}

const fengariWorker = new FengariWorker();
fengariWorker.onmessage = event => {
    const messages: LuaMessage[] = event.data.messages;
    outputTerminalContent.innerText = messages.map(m => m.text).join("\n");
};

function addLibsFromContext(context: __WebpackModuleApi.RequireContext) {
    for (const request of context.keys()) {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(context(request).default);
    }
}

addLibsFromContext(require.context("!!raw-loader!typescript/lib/", false, /lib(\.es(.+))?\.d\.ts$/));
addLibsFromContext(require.context("!!raw-loader!lua-types/core", true, /\.d\.ts$/));
// TODO: Generate it from lua-types/special/5.3.d.ts
for (const module of [
    require("!!raw-loader!lua-types/special/5.2-plus.d.ts"),
    require("!!raw-loader!lua-types/special/5.2-plus-or-jit.d.ts"),
    require("!!raw-loader!lua-types/special/5.3-plus.d.ts"),
    require("!!raw-loader!lua-types/special/5.4-pre.d.ts"),
]) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(module.default);
}

const tsEditor = monaco.editor.create(tsEditorContainer, {
    value: getInitialCode(),
    language: "typescript",
    minimap: { enabled: false },
    theme: "vs-dark",
});

const luaEditor = monaco.editor.create(luaEditorContainer, {
    value: "",
    language: "lua",
    minimap: { enabled: false },
    theme: "vs-dark",
    readOnly: true,
});

// More performant than `automaticLayout: true`, because container sizes can change only with window
window.onresize = () => {
    tsEditor.layout();
    luaEditor.layout();
};

let contentChangeTimeout: any;
tsEditor.onDidChangeModelContent(e => {
    clearTimeout(contentChangeTimeout);
    // Update transpile result no more often than every 250ms
    contentChangeTimeout = setTimeout(() => {
        onCodeChanged();
        updateCodeHistory(tsEditor.getValue());
    }, 250);
});

onCodeChanged();
