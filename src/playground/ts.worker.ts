// @ts-ignore
import * as worker from "monaco-editor/esm/vs/editor/editor.worker";
import { TypeScriptWorker } from "monaco-editor/esm/vs/language/typescript/tsWorker";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const emitHost: tstl.EmitHost = {
    getCurrentDirectory: () => ".",
    readFile: (fileName: string) => {
        const featureName = fileName.replace("/dist/lualib/", "").replace(".lua", "");
        return require(`raw-loader!typescript-to-lua/dist/lualib/${featureName}.lua`).default;
    },
};

// TODO: In latest monaco-typescript it returns `ts.Diagnostic[]`
const clearDiagnostics = (TypeScriptWorker as any).clearFiles;

export class CustomTypeScriptWorker extends TypeScriptWorker {
    public async getTranspileOutput() {
        const { transpiledFiles } = this.transpileLua();
        const [transpiledFile] = transpiledFiles;
        return { code: transpiledFile.lua!, ast: transpiledFile.luaAst! };
    }

    public async getSemanticDiagnostics(fileName: string) {
        const diagnostics = await super.getSemanticDiagnostics(fileName);
        const { diagnostics: transpileDiagnostics } = this.transpileLua();
        clearDiagnostics(transpileDiagnostics);
        return [...diagnostics, ...transpileDiagnostics];
    }

    private transpileLua() {
        const program = ((this as any)._languageService as ts.LanguageService).getProgram()!;

        const compilerOptions = program.getCompilerOptions();
        compilerOptions.luaLibImport = tstl.LuaLibImportKind.Inline;
        compilerOptions.luaTarget = tstl.LuaTarget.Lua53;

        const sourceFiles = program.getRootFileNames().map(n => program.getSourceFile(n)!);
        return tstl.transpile({ program, emitHost, sourceFiles });
    }
}

globalThis.onmessage = () => {
    worker.initialize((context: any, createData: any) => new CustomTypeScriptWorker(context, createData));
};
