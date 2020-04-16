import useThemeContext from "@theme/hooks/useThemeContext";
import clsx from "clsx";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import JSONTree from "react-json-tree";
import MonacoEditor from "react-monaco-editor";
import { version as tstlVersion } from "typescript-to-lua/package.json";
import { version as tsVersion } from "typescript/package.json";
import FengariWorker from "worker-loader?name=fengari.worker.js!./fengari.worker";
import { debounce } from "../../utils";
import { getInitialCode, updateCodeHistory } from "./code";
import type { LuaMessage } from "./fengari.worker";
import { monaco, useMonacoTheme } from "./monaco";
import styles from "./styles.module.scss";
import type { CustomTypeScriptWorker } from "./ts.worker";

let fengariWorker = new FengariWorker();
async function executeLua(code: string) {
    return new Promise<LuaMessage[]>((resolve) => {
        const timeout = setTimeout(() => {
            resolve([{ type: "print", text: "Lua code execution timed out" }]);
            fengariWorker.terminate();
            fengariWorker = new FengariWorker();
        }, 2500);

        fengariWorker.postMessage({ code });
        fengariWorker.addEventListener("message", (event) => {
            clearTimeout(timeout);
            resolve(event.data.messages);
        });
    });
}

interface EditorState {
    source: string;
    lua: string;
    sourceMap: string;
    ast: object;
    results: LuaMessage[];
}

const EditorContext = React.createContext<EditorContext>(null!);
interface EditorContext extends EditorState {
    updateModel(model: monaco.editor.ITextModel): void;
}

function EditorContextProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<EditorState>({ source: "", lua: "", ast: {}, sourceMap: "", results: [] });
    const updateModel = useCallback<EditorContext["updateModel"]>(async (model) => {
        const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
        const client = (await getWorker(model.uri)) as CustomTypeScriptWorker;
        const { lua, ast, sourceMap } = await client.getTranspileOutput(model.uri.toString());
        const source = model.getValue();

        setState({ source, lua, ast, sourceMap, results: [] });
        const results = await executeLua(lua);
        setState({ source, lua, ast, sourceMap, results });
    }, []);

    return <EditorContext.Provider value={{ updateModel, ...state }}>{children}</EditorContext.Provider>;
}

const commonMonacoOptions: monaco.editor.IEditorConstructionOptions = {
    minimap: { enabled: false },
    automaticLayout: true,
    scrollbar: { useShadows: false },
};

function InputPane() {
    const theme = useMonacoTheme();
    const ref = useRef<MonacoEditor>(null!);
    const { updateModel } = useContext(EditorContext);

    useEffect(() => {
        updateModel(ref.current!.editor!.getModel()!);
    }, []);

    const onChange = useCallback(
        debounce((newValue: string) => {
            updateCodeHistory(newValue);
            updateModel(ref.current!.editor!.getModel()!);
        }, 250),
        [],
    );

    return (
        <div className={styles.contentPane}>
            <MonacoEditor
                theme={theme}
                language="typescript"
                defaultValue={getInitialCode()}
                options={commonMonacoOptions}
                onChange={onChange}
                ref={ref}
            />
        </div>
    );
}

const astTheme = {
    scheme: "monokai",
    author: "wimer hazenberg (http://www.monokai.nl)",
    base00: "#1e1e1e",
    base01: "#383830",
    base02: "#49483e",
    base03: "#75715e",
    base04: "#a59f85",
    base05: "#f8f8f2",
    base06: "#f5f4f1",
    base07: "#f9f8f5",
    base08: "#f92672",
    base09: "#fd971f",
    base0A: "#f4bf75",
    base0B: "#a6e22e",
    base0C: "#a1efe4",
    base0D: "#66d9ef",
    base0E: "#ae81ff",
    base0F: "#cc6633",
};

const LuaSyntaxKind = __LUA_SYNTAX_KIND__;
function LuaAST({ ast }: { ast: object }) {
    const { isDarkTheme } = useThemeContext();
    return (
        <JSONTree
            data={ast}
            hideRoot={true}
            theme={astTheme}
            invertTheme={!isDarkTheme}
            valueRenderer={(raw, value, lastKey) => {
                if (lastKey === "kind") {
                    return <em>{LuaSyntaxKind[value as any]}</em>;
                }

                return <em>{raw}</em>;
            }}
        />
    );
}

function OutputPane() {
    const theme = useMonacoTheme();
    const { source, lua, sourceMap, ast, results } = useContext(EditorContext);
    const [isAstView, setAstView] = useState(false);
    const toggleAstView = useCallback(() => setAstView((x) => !x), []);
    const sourceMapUrl = useMemo(() => {
        const inputs = [lua, sourceMap, source]
            // Replace non-ASCII characters, because btoa not supports them
            .map((s) => btoa(s.replace(/[^\x00-\x7F]/g, "?")))
            .join(",");
        return `https://sokra.github.io/source-map-visualization#base64,${inputs}`;
    }, [lua, sourceMap, source]);

    return (
        <div className={styles.contentPane}>
            <div className={styles.outputEditor}>
                <div style={{ height: "100%", display: isAstView ? "none" : "block" }}>
                    <MonacoEditor
                        theme={theme}
                        language="lua"
                        value={lua}
                        options={{
                            ...commonMonacoOptions,
                            scrollBeyondLastLine: false,
                            scrollBeyondLastColumn: 15,
                            readOnly: true,
                        }}
                    />
                </div>
                <div style={{ height: "100%", overflow: "auto", display: isAstView ? "block" : "none" }}>
                    <LuaAST ast={ast} />
                </div>

                <div className={styles.outputControls}>
                    <button
                        className={clsx("button button--outline button--primary", !isAstView && "button--active")}
                        onClick={toggleAstView}
                    >
                        {isAstView ? "Lua AST" : "TEXT"}
                    </button>
                    <a className="button button--success" href={sourceMapUrl} target="_blank">
                        Source Map
                    </a>
                </div>
            </div>

            <div className={styles.editorOutput}>
                <div className={styles.editorOutputLineNumbers}>>_</div>
                <div className={styles.editorOutputTerminal}>
                    {results.map((message, idx) => (
                        <div key={idx}>{message.text}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Playground() {
    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.navbarVersion}>
                    TSTL{" "}
                    <a
                        href="https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/CHANGELOG.md"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <b>v{tstlVersion}</b>
                    </a>
                    <br />
                    &nbsp;&nbsp;TS <b>v{tsVersion}</b>
                </div>
            </nav>
            <div className={styles.content}>
                <EditorContextProvider>
                    <InputPane />
                    <OutputPane />
                </EditorContextProvider>
            </div>
        </>
    );
}
