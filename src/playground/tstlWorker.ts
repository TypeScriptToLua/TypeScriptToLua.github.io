import {CompilerOptions, LuaTarget, LuaLibImportKind} from 'typescript-to-lua/dist/CompilerOptions';
import {LuaTranspiler, TranspileResult} from "typescript-to-lua/dist/LuaTranspiler";

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
    ArrayFlat: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayFlat.lua"),
    ArrayFlatMap: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArrayFlatMap.lua"),
    ArraySetLength: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ArraySetLength.lua"),
    ClassIndex: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ClassIndex.lua"),
    ClassNewIndex: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ClassNewIndex.lua"),
    FunctionApply: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/FunctionApply.lua"),
    FunctionBind: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/FunctionBind.lua"),
    FunctionCall: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/FunctionCall.lua"),
    Index: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Index.lua"),
    InstanceOf: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/InstanceOf.lua"),
    Iterator: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Iterator.lua"),
    Map: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Map.lua"),
    NewIndex: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/NewIndex.lua"),
    ObjectAssign: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ObjectAssign.lua"),
    ObjectEntries: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ObjectEntries.lua"),
    ObjectFromEntries: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ObjectFromEntries.lua"),
    ObjectKeys: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ObjectKeys.lua"),
    ObjectValues: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/ObjectValues.lua"),
    Set: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Set.lua"),
    WeakMap: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/WeakMap.lua"),
    WeakSet: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/WeakSet.lua"),
    SourceMapTraceBack: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/SourceMapTraceBack.lua"),
    StringReplace: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/StringReplace.lua"),
    StringSplit: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/StringSplit.lua"),
    StringConcat: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/StringConcat.lua"),
    Symbol: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/Symbol.lua"),
    SymbolRegistry: require("raw-loader!../../node_modules/typescript-to-lua/dist/lualib/SymbolRegistry.lua"),
}

declare var self: any;

self.fs = {
    readFileSync: (fileName: string) => {
        let featureName = fileName.replace("/dist/lualib/", "").replace(".lua", "");
        return new Buffer(luaLib[featureName]);
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
      console.log(filename);
      if (filename === 'file.ts') {
        return ts.createSourceFile(
            filename, str, ts.ScriptTarget.Latest, false);
      }
      if (filename.startsWith('lib.') && filename.endsWith('.d.ts')) {
        return ts.createSourceFile(
            filename, require(`!raw-loader!../../node_modules/typescript/lib/${filename}`), ts.ScriptTarget.Latest, false);
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
