import {CompilerOptions, LuaTarget, LuaLibImportKind} from 'typescript-to-lua/dist/CompilerOptions';
import {LuaTranspiler, TranspileResult} from "typescript-to-lua/dist/LuaTranspiler";

import * as ts from "typescript";

declare var self: any;

/** Dummy fs for lualib compatibility */
self.fs = {
    readFileSync: (fileName: string) => {
        let featureName = fileName.replace("/dist/lualib/", "").replace(".lua", "");
        return new Buffer(require(`raw-loader!../../node_modules/typescript-to-lua/dist/lualib/${featureName}.lua`));
    }
}

onmessage = (event: MessageEvent) => {
    const result = transpileString(event.data.tsStr);
    postMessage({luaAST: result.luaAST, luaStr: result.lua});
};

function transpileString(str: string, options: CompilerOptions = {
  luaLibImport: LuaLibImportKind.Inline,
  luaTarget: LuaTarget.Lua53,
}): TranspileResult {
  const compilerHost = {
    directoryExists: () => true,
    fileExists: (fileName: string): boolean => true,
    getCanonicalFileName: (fileName: string) => fileName,
    getCurrentDirectory: () => '',
    getDefaultLibFileName: () => 'lib.es6.d.ts',
    getDirectories: () => [],
    getNewLine: () => '\n',

    getSourceFile: (filename: string, languageVersion: any) => {
      if (filename === 'file.ts') {
        return ts.createSourceFile(
            filename, str, ts.ScriptTarget.Latest, false);
      }
      if (filename.startsWith('lib.') && filename.endsWith('.d.ts')) {
        return ts.createSourceFile(
            filename, require(`!raw-loader!../../node_modules/typescript/lib/lib.${filename.slice(4)}`), ts.ScriptTarget.Latest, false);
      }
      return undefined;
    },

    readFile: () => '',

    useCaseSensitiveFileNames: () => false,
    // Don't write output
    writeFile: (name: string, text: string , writeByteOrderMark: any) => null,
  };
  const program = ts.createProgram(['file.ts'], options as ts.CompilerOptions, compilerHost);

  const transpiler = new LuaTranspiler(program);

  return transpiler.transpileSourceFile(program.getSourceFile("file.ts") as ts.SourceFile);
}
