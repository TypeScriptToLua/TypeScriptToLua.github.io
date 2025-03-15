import { useColorMode } from "@docusaurus/theme-common";
import clsx from "clsx";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { JSONTree } from "react-json-tree";
import MonacoEditor, { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";
import tstlPackageJson from "typescript-to-lua/package.json";
import tsPackageJson from "typescript/package.json";
import { debounce } from "../../utils";
import { getInitialCode, updateCodeHistory } from "./code";
import { ConsoleMessage, executeLua } from "./execute";
import { monaco, useMonacoTheme } from "./monaco";
import styles from "./styles.module.scss";
import { jsonTreeTheme } from "./themes";
import type { CustomTypeScriptWorker } from "./ts.worker";
import { baseCompilerOptions } from "./compilerConfig";
import { LuaTarget } from "typescript-to-lua";

enum PanelKind {
    Input,
    Output,
}
interface PanelState {
    activePanel: PanelKind;
}
interface PanelContext extends PanelState {
    setActivePanel(panelID: PanelKind): void;
}

const PanelContext = React.createContext<PanelContext>(null!);

function PanelContextProvider({ children }: { children: React.ReactNode }) {
    const [activePanel, setActivePanel] = useState<PanelKind>(PanelKind.Input);

    return <PanelContext.Provider value={{ activePanel, setActivePanel }}>{children}</PanelContext.Provider>;
}
interface EditorState {
    source: string;
    target: LuaTarget;
    lua: string;
    sourceMap: string;
    ast: object;
    results: ConsoleMessage[];
}

const EditorContext = React.createContext<EditorContext>(null!);
interface EditorContext extends EditorState {
    updateModel(
        worker: monaco.languages.typescript.TypeScriptWorker,
        model: monaco.editor.ITextModel,
        target: LuaTarget,
    ): void;
}

function EditorContextProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<EditorState>({
        source: "",
        target: LuaTarget.Lua54,
        lua: "",
        ast: {},
        sourceMap: "",
        results: [],
    });
    const updateModel = useCallback<EditorContext["updateModel"]>(async (worker, model, target) => {
        const client = worker as CustomTypeScriptWorker;
        const { lua, ast, sourceMap } = await client.getTranspileOutput(model.uri.toString(), target);
        const source = model.getValue();

        setState({ source, target, lua, ast, sourceMap, results: [] });
        const results = await executeLua(lua);
        if (target !== LuaTarget.Lua54) {
            results.unshift({
                method: "warning",
                data: ["Web execution expects Lua 5.4 and might not work for other targets"],
            });
        }
        setState({ source, target, lua, ast, sourceMap, results });
    }, []);

    return <EditorContext.Provider value={{ updateModel, ...state }}>{children}</EditorContext.Provider>;
}

const commonMonacoOptions: monaco.editor.IEditorConstructionOptions = {
    minimap: { enabled: false },
    automaticLayout: true,
    scrollbar: { useShadows: false },
    fixedOverflowWidgets: true,
};

function InputPane({ onWorkerSet }: { onWorkerSet(updateTarget: (target: LuaTarget) => void): void }) {
    const theme = useMonacoTheme();
    const { updateModel } = useContext(EditorContext);

    const { activePanel } = useContext(PanelContext);
    const [initialCode, initialTarget] = getInitialCode();

    let myWorker: monaco.languages.typescript.TypeScriptWorker | undefined = undefined;
    let myEditor: monaco.editor.IStandaloneCodeEditor | undefined = undefined;
    let target = initialTarget;

    function updateInputs(code: string, target: LuaTarget) {
        if (myWorker && myEditor) {
            updateCodeHistory(code, target);
            updateModel(myWorker, myEditor.getModel()!, target);
        }
    }

    const onMount: OnMount = async (editor, monaco) => {
        myEditor = editor;
        const workerGetter = await monaco.languages.typescript.getTypeScriptWorker();
        myWorker = await workerGetter(editor.getModel()!.uri);
        updateModel(myWorker, editor.getModel()!, target);

        onWorkerSet((newTarget) => {
            target = newTarget;
            updateInputs(myEditor?.getModel()?.getValue() ?? "", newTarget);
        });
    };

    const onChange: OnChange = useCallback(
        debounce((newValue) => {
            updateInputs(newValue ?? "", target);
        }, 250),
        [],
    );

    const beforeMount: BeforeMount = (monaco) => {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
            ...baseCompilerOptions,
        });

        // // TODO: Generate it from lua-types/5.4.d.ts
        for (const module of [
            require("!!raw-loader!@typescript-to-lua/language-extensions/index.d.ts"),
            require("!!raw-loader!lua-types/core/coroutine.d.ts"),
            require("!!raw-loader!lua-types/core/global.d.ts"),
            require("!!raw-loader!lua-types/core/math.d.ts"),
            require("!!raw-loader!lua-types/core/metatable.d.ts"),
            require("!!raw-loader!lua-types/core/string.d.ts"),
            require("!!raw-loader!lua-types/core/table.d.ts"),
            require("!!raw-loader!lua-types/core/coroutine.d.ts"),
            require("!!raw-loader!lua-types/core/coroutine.d.ts"),
            require("!!raw-loader!lua-types/core/coroutine.d.ts"),
            require("!!raw-loader!lua-types/core/coroutine.d.ts"),
            require("!!raw-loader!lua-types/special/5.2-plus.d.ts"),
            require("!!raw-loader!lua-types/special/5.2-plus-or-jit.d.ts"),
            require("!!raw-loader!lua-types/special/5.3-plus.d.ts"),
            require("!!raw-loader!lua-types/special/5.4-pre.d.ts"),
        ]) {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(module.default);
        }
    };

    return (
        <div className={clsx(styles.contentPane, activePanel != PanelKind.Input && styles.contentPaneHiddenMobile)}>
            <MonacoEditor
                theme={theme}
                language="typescript"
                defaultValue={initialCode}
                options={commonMonacoOptions}
                beforeMount={beforeMount}
                onMount={onMount}
                onChange={onChange}
            />
        </div>
    );
}

const LuaSyntaxKind = __LUA_SYNTAX_KIND__;
function LuaAST({ ast }: { ast: object }) {
    const { colorMode } = useColorMode();

    return (
        <JSONTree
            data={ast}
            hideRoot={true}
            theme={jsonTreeTheme}
            invertTheme={colorMode !== "dark"}
            valueRenderer={(raw, value, lastKey) => {
                if (lastKey === "kind") {
                    return <em>{LuaSyntaxKind[value as any]}</em>;
                }

                return <em>{raw}</em>;
            }}
        />
    );
}

function formatLuaOutputData(data: any): string {
    return data?.toString() ?? "";
}

function consoleOutputRowClass(data: ConsoleMessage) {
    let rowClass = styles.luaOutputTerminalRow;

    if (data.method === "error") {
        rowClass += " " + styles.luaOutputTerminalError;
    }
    if (data.method === "warning") {
        rowClass += " " + styles.luaOutputTerminalWarning;
    }

    return rowClass;
}

function LuaOutput() {
    const { results } = useContext(EditorContext);

    return (
        <div className={styles.luaOutput}>
            <div className={styles.luaOutputLineNumbers}>{">_"}</div>
            <div className={styles.luaOutputTerminal}>
                {results.map((r, i) => (
                    <div className={consoleOutputRowClass(r)} key={i}>
                        {r.data.map(formatLuaOutputData).join("\t")}
                    </div>
                ))}
            </div>
        </div>
    );
}

function OutputPane() {
    const theme = useMonacoTheme();
    const { source, lua, sourceMap, ast } = useContext(EditorContext);
    const [isAstView, setAstView] = useState(false);
    const toggleAstView = useCallback(() => setAstView((x) => !x), []);
    const sourceMapUrl = useMemo(() => {
        const inputs = [lua, sourceMap, source]
            // Replace non-ASCII characters, because btoa not supports them
            .map((s) => btoa(s.replace(/[^\x00-\x7F]/g, "?")))
            .join(",");
        return `https://sokra.github.io/source-map-visualization#base64,${inputs}`;
    }, [lua, sourceMap, source]);

    const { activePanel } = useContext(PanelContext);

    return (
        <div className={clsx(styles.contentPane, activePanel != PanelKind.Output && styles.contentPaneHiddenMobile)}>
            <div className={styles.outputEditor}>
                <div style={{ height: "100%", display: isAstView ? "none" : "block" }}>
                    <MonacoEditor
                        theme={theme}
                        language="lua"
                        defaultValue="starting transpiler..."
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
                        {isAstView ? "Text" : "Lua AST"}
                    </button>
                    <a className="button button--success" href={sourceMapUrl} target="_blank">
                        Source Map
                    </a>
                </div>
            </div>

            <LuaOutput />
        </div>
    );
}

function PlaygroundNavbar({ onTargetChange }: { onTargetChange(target: LuaTarget): void }) {
    const tstlLink = "https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/CHANGELOG.md";
    const tsMajor = tsPackageJson.version?.split(".")[0];
    const tsMinor = tsPackageJson.version?.split(".")[1];
    const tsLink = `https://www.typescriptlang.org/docs/handbook/release-notes/typescript-${tsMajor}-${tsMinor}.html`;

    const { activePanel, setActivePanel } = useContext(PanelContext);
    const [_, initialTarget] = getInitialCode();

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarVersions}>
                TSTL{" "}
                <a href={tstlLink} target="_blank" rel="noopener">
                    <b>v{tstlPackageJson.version}</b>
                </a>
                <br />
                &nbsp;&nbsp;TS{" "}
                <a href={tsLink} target="_blank" rel="noopener">
                    <b>v{tsPackageJson.version}</b>
                </a>
            </div>
            <div className={styles.playgroundTarget}>
                Lua target:{" "}
                <select defaultValue={initialTarget} onChange={(e) => onTargetChange(e.target.value as LuaTarget)}>
                    <option value={LuaTarget.Lua50}>5.0</option>
                    <option value={LuaTarget.Lua51}>5.1</option>
                    <option value={LuaTarget.Lua52}>5.2</option>
                    <option value={LuaTarget.Lua53}>5.3</option>
                    <option value={LuaTarget.Lua54}>5.4</option>
                    <option value={LuaTarget.LuaJIT}>JIT</option>
                    <option value={LuaTarget.Luau}>Luau</option>
                    <option value={LuaTarget.Universal}>Universal</option>
                </select>
            </div>
            <div className={styles.navBarPanelSelection}>
                <button
                    className={clsx("button button--primary button--outline", activePanel == 0 && "button--active")}
                    onClick={() => setActivePanel(PanelKind.Input)}
                >
                    TS Input
                </button>
                <button
                    className={clsx("button button--primary button--outline", activePanel == 1 && "button--active")}
                    onClick={() => setActivePanel(PanelKind.Output)}
                >
                    Lua Output
                </button>
            </div>
        </nav>
    );
}

export default function Playground() {
    let updateModelTarget: ((target: LuaTarget) => void) | undefined;
    const onTargetChange = useCallback((target: LuaTarget) => {
        if (updateModelTarget) {
            updateModelTarget(target);
        }
    }, []);
    const onWorkerSet = useCallback((cb: (target: LuaTarget) => void) => {
        updateModelTarget = cb;
    }, []);

    return (
        <>
            <PanelContextProvider>
                <PlaygroundNavbar onTargetChange={onTargetChange} />
                <div className={styles.content}>
                    <EditorContextProvider>
                        <InputPane onWorkerSet={onWorkerSet} />
                        <OutputPane />
                    </EditorContextProvider>
                </div>
            </PanelContextProvider>
        </>
    );
}
