import useThemeContext from "@theme/hooks/useThemeContext";
import clsx from "clsx";
import { Console as ConsoleFeed } from "console-feed";
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import JSONTree from "react-json-tree";
import MonacoEditor from "react-monaco-editor";
import tstlPackageJson from "typescript-to-lua/package.json";
import tsPackageJson from "typescript/package.json";
import { debounce } from "../../utils";
import { getInitialCode, updateCodeHistory } from "./code";
import { ConsoleMessage, executeLua } from "./execute";
import { monaco, useMonacoTheme } from "./monaco";
import styles from "./styles.module.scss";
import { consoleFeedTheme, jsonTreeTheme } from "./themes";
import type { CustomTypeScriptWorker } from "./ts.worker";

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
    lua: string;
    sourceMap: string;
    ast: object;
    results: ConsoleMessage[];
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
    fixedOverflowWidgets: true,
};

function InputPane() {
    const theme = useMonacoTheme();
    const ref = useRef<MonacoEditor>(null);
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

    const { activePanel } = useContext(PanelContext);

    return (
        <div className={clsx(styles.contentPane, activePanel != PanelKind.Input && styles.contentPaneHiddenMobile)}>
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

const LuaSyntaxKind = __LUA_SYNTAX_KIND__;
function LuaAST({ ast }: { ast: object }) {
    const { isDarkTheme } = useThemeContext();

    return (
        <JSONTree
            data={ast}
            hideRoot={true}
            theme={jsonTreeTheme}
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

function LuaOutput() {
    const { isDarkTheme } = useThemeContext();
    const { results } = useContext(EditorContext);

    return (
        <div className={styles.luaOutput}>
            <div className={styles.luaOutputLineNumbers}>{">_"}</div>
            <div className={styles.luaOutputTerminal}>
                <ConsoleFeed
                    key={isDarkTheme} // It does not update styles without re-mount
                    logs={results as any}
                    variant={isDarkTheme ? "dark" : "light"}
                    styles={consoleFeedTheme(isDarkTheme)}
                />
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

function PlaygroundNavbar() {
    const tstlLink = "https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/CHANGELOG.md";
    const tsMajor = tsPackageJson.version?.split(".")[0];
    const tsMinor = tsPackageJson.version?.split(".")[1];
    const tsLink = `https://www.typescriptlang.org/docs/handbook/release-notes/typescript-${tsMajor}-${tsMinor}.html`;

    const { activePanel, setActivePanel } = useContext(PanelContext);

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
    return (
        <>
            <PanelContextProvider>
                <PlaygroundNavbar />
                <div className={styles.content}>
                    <EditorContextProvider>
                        <InputPane />
                        <OutputPane />
                    </EditorContextProvider>
                </div>
            </PanelContextProvider>
        </>
    );
}
