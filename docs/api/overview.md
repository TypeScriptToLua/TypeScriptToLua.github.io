---
title: Overview
---

## High-level API

The high level API allows you to simply invoke several common transpiler operations using well-known language primitives, handling usage of TypeScript API for you.

### TranspileString

Transpile a string containing TypeScript source code to Lua.

**Arguments:**

- Source: string - The TypeScript source code to transpile.
- _[Optional]_ Options: tstl.CompilerOptions - CompilerOptions to use.

**Example:**

```ts
import * as tstl from "typescript-to-lua";

const result = tstl.transpileString(`const foo = "bar";`, { luaTarget: tstl.LuaTarget.Lua53 });
console.log(result.diagnostics);
console.log(result.file);
```

### TranspileFiles

Transpile a collection of TypeScript files to Lua.

**Arguments:**

- FileNames: string[] - An array of file paths to the TypeScript files to be transpiled.
- _[Optional]_ Options: tstl.CompilerOptions - CompilerOptions to use.

**Example:**

```ts
import * as tstl from "typescript-to-lua";

const result = tstl.transpileFiles(["file1.ts", "file2.ts"], { luaTarget: tstl.LuaTarget.Lua53 });
console.log(result.diagnostics);
console.log(result.emitResult);
```

### TranspileProject

Transpile a TypeScript project to Lua.

**Arguments:**

- tsConfigPath: string - The file path to a TypeScript project's `tsconfig.json` file.
- _[Optional]_ extendedOptions: tstl.CompilerOptions - The tsConfig already contains options, this extends those options.

**Example:**

```ts
import * as tstl from "typescript-to-lua";

const result = tstl.transpileProject("tsconfig.json", { luaTarget: tstl.LuaTarget.Lua53 });
console.log(result.diagnostics);
console.log(result.emitResult);
```

### TranspileVirtualProject

Transpile a virtual project to Lua. A virtual project is a record (like an object literal for example) where keys are file names, and values are the contents of these files. This can be used to transpile a collection of files without having these files physically on disk.

**Arguments:**

- Files: Record<string, string> - A record of fileName keys and fileContent values.
- _[Optional]_ Options: tstl.CompilerOptions - CompilerOptions to use.

**Example:**

```ts
import * as tstl from "typescript-to-lua";

const result = tstl.transpileVirtualProject(
  {
    "file1.ts": `const foo = "bar";`,
    "file2.ts": `const bar = "baz";`,
  },
  { luaTarget: tstl.LuaTarget.Lua53 },
);
console.log(result.diagnostics);
console.log(result.transpiledFiles);
```

## Low-level API

On the contrast with high-level API, low-level API requires you to to manage TypeScript project yourself. See [Using the Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) page for the introduction to TypeScript API.

### Transpile

**Arguments:**

- program: ts.Program - The TypeScript program to transpile (note: unlike the high-level API, compilerOptions is part of the program and cannot be supplied separately).
- _[Optional]_ sourceFiles: ts.SourceFile[] - A collection of `SourceFile`s to transpile, `program.getSourceFiles()` by default.
- _[Optional]_ customTransformers: ts.CustomTransformers - List of extra [TypeScript transformers](../configuration.md#transformers).
- _[Optional]_ plugins: tstl.Plugin[] - List of [TypeScriptToLua plugins](plugins.md).
- _[Optional]_ emitHost: tstl.EmitHost - Provides the methods for reading/writing files, useful in cases where you need something other than regular reading from disk. Defaults to `ts.sys`.

**Example:**

```ts
const reportDiagnostic = tstl.createDiagnosticReporter(true);
const configFileName = path.resolve(__dirname, "tsconfig.json");
const parsedCommandLine = tstl.parseConfigFileWithSystem(configFileName);
if (parsedCommandLine.errors.length > 0) {
  parsedCommandLine.errors.forEach(reportDiagnostic);
  return;
}

const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);
const { transpiledFiles, diagnostics: transpileDiagnostics } = tstl.transpile({ program });

const emitResult = tstl.emitTranspiledFiles(options, transpiledFiles);
emitResult.forEach(({ name, text }) => ts.sys.writeFile(name, text));

const diagnostics = ts.sortAndDeduplicateDiagnostics([...ts.getPreEmitDiagnostics(program), ...transpileDiagnostics]);
diagnostics.forEach(reportDiagnostic);
```
