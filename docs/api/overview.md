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

### Transpiler class

The `Transpiler` class creates an instance of the tstl transpiler that is used to implement the high-level API. The transpiler allows passing a raw tstl program object and providing different transpilation parameters, such as the EmitHost object to be used to read/write files.

The main usage of the Transpiler is as follows:

```ts
import * as tstl from "typescript-to-lua";

const { emitSkipped, diagnostics } = new tstl.Transpiler().emit(emitOptions);

// Provide a custom emitHost for custom reading/writing of files:
const { emitSkipped, diagnostics } = new tstl.Transpiler(customEmitHost).emit(emitOptions);
```

**Emit options:**

The Transpiler class `emit` accepts one argument which is an options object you can use to customize the behavior of the transpiler. The options in this object are:

- program: ts.Program - The TypeScript program to transpile (note: unlike the high-level API, `compilerOptions`` is part of the program and cannot be supplied separately).
- _[Optional]_ sourceFiles: ts.SourceFile[] - A collection of `SourceFile`s to transpile, `program.getSourceFiles()` by default.
- _[Optional]_ customTransformers: ts.CustomTransformers - List of extra [TypeScript transformers](../configuration.md#transformers).
- _[Optional]_ plugins: tstl.Plugin[] - List of [TypeScriptToLua plugins](plugins.md).
- _[Optional]_ writeFile: ts.WriteFileCallback - Provides a callback to use to emit the final file result, instead of trying to write them to disk.

**Example:**

```ts
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

// Parse existing tsconfig.json
const configFileName = path.resolve(__dirname, "tsconfig.json");
const parsedCommandLine = tstl.parseConfigFileWithSystem(configFileName);
if (parsedCommandLine.errors.length > 0) {
  parsedCommandLine.errors.forEach(reportDiagnostic);
  return;
}

// Set tstl-specific configuration options
parsedCommandLine.options.luaTarget = tstl.LuaTarget.Lua54;

// Create a TS program to feed to the transpiler
const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);

// Create in-memory source file
const extraSourceFile = ts.createSourceFile("my-source-file.ts", "// my ts code");

const emitResults: Record<string, string> = {};

// Call the Typescript-to-Lua transpiler with emit options
const { diagnostics } = new tstl.Transpiler().transpile({
  program, // Provide the program to transpile, including compiler options!
  sourceFiles: [extraSourceFile],
  writeFile(fileName, data) {
    emitResults[fileName] = data; // Instead of writing to file, emit files to this object in memory
  },
  plugins: [
    // We can even provide plugins directly
    {
      beforeTransform(program, CompilerOptions, emitHost) {
        console.log("before transforming plugin hook!");
      },
      afterPrint(program, options, emitHost, result) {
        console.log("after printing plugin hook!");
      },
    },
  ],
});

// Use TS to report all diagnostics to console
const reportDiagnostic = tstl.createDiagnosticReporter(true);
const diagnostics = ts.sortAndDeduplicateDiagnostics([...ts.getPreEmitDiagnostics(program), ...transpileDiagnostics]);
diagnostics.forEach(reportDiagnostic);
```
