import * as worker from "monaco-editor/esm/vs/editor/editor.worker";
import { TypeScriptWorker } from "cdn.tsWorker";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

// Mock unsupported in path-browserify@0.0.1 parse and format functions used for normalization in
// https://github.com/TypeScriptToLua/TypeScriptToLua/blob/3ebc76745f74ce709bf0ba39f830a8f5cf94c473/src/transformation/visitors/modules/import.ts#L25-L28
require("path").parse = (x: any) => x;
require("path").format = (x: any) => x;

const libContext = require.context(
    `raw-loader!typescript-to-lua/dist/lualib`,
    true,
    /(.+)(?<!lualib_bundle)\.lua$/,
);
const emitHost: tstl.EmitHost = {
    directoryExists: () => false,
    fileExists: (fileName) => ts.sys.fileExists(fileName),
    getCurrentDirectory: () => "",
    readFile: (fileName: string) => {
        // Make sure this json is read as rawfile and not as ESM JSON module.
        if (fileName.endsWith("universal/lualib_module_info.json")) {
            // Make sure this json is read as rawfile and not as ESM JSON module.
            return require("typescript-to-lua/dist/lualib/universal/lualib_module_info.json.raw!=!raw-loader!typescript-to-lua/dist/lualib/universal/lualib_module_info.json")
                .default;
        }

        const [, featureName] = fileName.match(/\/dist\/lualib\/(.+)\.lua$/) || [];
        if (featureName === undefined) {
            throw new Error(`Unexpected file to read: ${fileName}`);
        }

        return libContext(`./${featureName}.lua`).default;
    },
    writeFile() {},
};

const transpiler = new tstl.Transpiler({ emitHost });

export class CustomTypeScriptWorker extends TypeScriptWorker {
    private lastResult?: { diagnostics: readonly ts.Diagnostic[]; ast: tstl.File; lua: string; sourceMap: string };

    public async getTranspileOutput(fileName: string) {
        const { ast, lua, sourceMap } = this.transpileLua(fileName);
        return { ast, lua, sourceMap };
    }

    public async getSemanticDiagnostics(fileName: string) {
        const diagnostics = await super.getSemanticDiagnostics(fileName);
        const { diagnostics: transpileDiagnostics } = this.lastResult ?? this.transpileLua(fileName);
        return [
            ...diagnostics,
            ...TypeScriptWorker.clearFiles(transpileDiagnostics.map((diag) => ({ ...diag, code: diag.source as any }))),
        ];
    }

    private transpileLua(fileName: string) {
        const program = this._languageService.getProgram()!;
        const sourceFile = program.getSourceFile(fileName)!;

        const compilerOptions: tstl.CompilerOptions = program.getCompilerOptions();
        compilerOptions.rootDir = "inmemory://model/";
        compilerOptions.luaLibImport = tstl.LuaLibImportKind.Inline;
        compilerOptions.luaTarget = tstl.LuaTarget.Lua53;
        compilerOptions.sourceMap = true;

        let ast!: tstl.File;
        let lua!: string;
        let sourceMap!: string;
        const { diagnostics } = transpiler.emit({
            program,
            sourceFiles: [sourceFile],
            writeFile(fileName, data, _writeBOM, _onError, sourceFiles = []) {
                if (!sourceFiles.includes(sourceFile)) return;
                if (fileName.endsWith(".lua")) lua = data;
                if (fileName.endsWith(".lua.map")) sourceMap = data;
            },
            plugins: [
                {
                    visitors: {
                        [ts.SyntaxKind.SourceFile](node, context) {
                            const [file] = context.superTransformNode(node) as [tstl.File];

                            if (node === sourceFile) {
                                ast = file;
                            }

                            return file;
                        },
                    },
                },
            ],
        });

        this.lastResult = { diagnostics, ast, lua, sourceMap };
        return this.lastResult;
    }
}

globalThis.onmessage = () => {
    worker.initialize((context, createData) => new CustomTypeScriptWorker(context, createData));
};
