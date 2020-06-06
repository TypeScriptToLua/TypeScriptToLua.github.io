import * as worker from "monaco-editor/esm/vs/editor/editor.worker";
import { TypeScriptWorker } from "monaco-editor/esm/vs/language/typescript/tsWorker";
import * as tstl from "typescript-to-lua";

// Mock unsupported in path-browserify@0.0.1 parse and format functions used for normalization in
// https://github.com/TypeScriptToLua/TypeScriptToLua/blob/3ebc76745f74ce709bf0ba39f830a8f5cf94c473/src/transformation/visitors/modules/import.ts#L25-L28
require("path").parse = (x: any) => x;
require("path").format = (x: any) => x;

const libContext = require.context(`raw-loader!typescript-to-lua/dist/lualib`, true, /(.+)(?<!lualib_bundle)\.lua$/);
const emitHost: tstl.EmitHost = {
    getCurrentDirectory: () => "",
    readFile: (fileName: string) => {
        const [, featureName] = fileName.match(/\/dist\/lualib\/(.+)\.lua$/) || [];
        if (featureName === undefined) {
            throw new Error(`Unexpected file to read: ${fileName}`);
        }

        return libContext(`./${featureName}.lua`).default;
    },
};

export class CustomTypeScriptWorker extends TypeScriptWorker {
    public async getTranspileOutput(fileName: string) {
        const { transpiledFiles } = this.transpileLua(fileName);
        const [file] = transpiledFiles;
        return { lua: file.lua!, ast: file.luaAst!, sourceMap: file.sourceMap! };
    }

    public async getSemanticDiagnostics(fileName: string) {
        const diagnostics = await super.getSemanticDiagnostics(fileName);
        const { diagnostics: transpileDiagnostics } = this.transpileLua(fileName);
        return [
            ...diagnostics,
            ...TypeScriptWorker.clearFiles(transpileDiagnostics.map((diag) => ({ ...diag, code: diag.source as any }))),
        ];
    }

    private transpileLua(fileName: string) {
        const program = this._languageService.getProgram()!;

        const compilerOptions: tstl.CompilerOptions = program.getCompilerOptions();
        compilerOptions.rootDir = "inmemory://model/";
        compilerOptions.luaLibImport = tstl.LuaLibImportKind.Inline;
        compilerOptions.luaTarget = tstl.LuaTarget.Lua53;

        return tstl.transpile({ program, emitHost, sourceFiles: [program.getSourceFile(fileName)!] });
    }
}

globalThis.onmessage = () => {
    worker.initialize((context, createData) => new CustomTypeScriptWorker(context, createData));
};
