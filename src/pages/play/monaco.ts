import useThemeContext from "@theme/hooks/useThemeContext";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/editor/edcore.main";
import "monaco-editor/esm/vs/basic-languages/lua/lua.contribution";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import EditorWorker from "worker-loader?name=editor.worker.js!monaco-editor/esm/vs/editor/editor.worker.js";
import TsWorker from "worker-loader?name=ts.worker.js!./ts.worker";

export { monaco };

// TODO: MonacoEnvironment should be a var
(globalThis as { MonacoEnvironment?: typeof MonacoEnvironment }).MonacoEnvironment = {
    getWorker(_workerId, label) {
        if (label === "typescript") {
            return new TsWorker();
        }

        return new EditorWorker();
    },
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

export function useMonacoTheme() {
    const { isDarkTheme } = useThemeContext();
    return isDarkTheme ? "vs-dark" : "vs";
}
