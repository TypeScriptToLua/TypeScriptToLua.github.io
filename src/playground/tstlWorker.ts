import {CompilerOptions, LuaTarget, LuaLibImportKind} from 'typescript-to-lua/dist/CompilerOptions';
import {LuaTranspiler} from "typescript-to-lua/dist/LuaTranspiler";

import * as tstl from 'typescript-to-lua/dist/LuaAST';

import * as ts from "typescript";

// TODO this needs to be improved it's a mess;
const luaLib: { [key: string]: string } = {
    ArrayConcat: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayConcat.lua"),
    ArrayEvery: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayEvery.lua"),
    ArrayFilter: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayFilter.lua"),
    ArrayForEach: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayForEach.lua"),
    ArrayIndexOf: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayIndexOf.lua"),
    ArrayMap: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayMap.lua"),
    ArrayPush: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayPush.lua"),
    ArrayReverse: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayReverse.lua"),
    ArrayShift: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayShift.lua"),
    ArrayUnshift: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayUnshift.lua"),
    ArraySort: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArraySort.lua"),
    ArraySlice: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArraySlice.lua"),
    ArraySome: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArraySome.lua"),
    ArraySplice: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArraySplice.lua"),
    InstanceOf: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/InstanceOf.lua"),
    Map: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Map.lua"),
    Set: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Set.lua"),
    StringReplace: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/StringReplace.lua"),
    StringSplit: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/StringSplit.lua"),
    Ternary: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Ternary.lua"),
}

declare var self: any;

self.fs = {
    readFileSync: (fileName: string) => {
        let featureName = fileName.replace("/dist/lualib/", "").replace(".lua", "");
        return new Buffer(luaLib[featureName]);
    }
}

const libSource = require('!raw-loader!../../node_modules/typescript/lib/lib.es6.d.ts');

onmessage = (event: MessageEvent) => {
    const [luaAST, luaStr] = transpileString(event.data.tsStr);
    postMessage({luaAST, luaStr});
};

function transpileString(str: string, options: CompilerOptions = {
  luaLibImport: LuaLibImportKind.Inline,
  luaTarget: LuaTarget.Lua53,
}): [tstl.Block, string] {
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
      if (filename === 'lib.es6.d.ts') {
        return ts.createSourceFile(
            filename, libSource, ts.ScriptTarget.Latest, false);
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

  return transpiler.transpileSourceFileKeepAST(program.getSourceFile("file.ts") as ts.SourceFile);
}
