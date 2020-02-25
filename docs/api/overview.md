---
title: Overview
---

TypeScriptToLua provides a high-level and a low-level API. The high-level API can be used to invoke basic transpiler operations. The low-level API can be used to extend and override default transpiler behavior, to customize it to your specific environment.

## High-level API

The high level API allows you to simply invoke several common transpiler operations from code.

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

The low-level TypeScriptToLua API allows for extending or modifying of the default tstl transpilation process. For this to make sense it is important to know the process can broadly be split into **two phases: transforming and printing**. The first step of each transpilation is to **transform** the TypeScript AST of each file to a Lua AST. The next step is to **print** the resulting Lua AST to a string. TypeScriptToLua therefore implements a **LuaTransformer** and **LuaPrinter**. These two classes can be modified using the low-level API.

### Transpile

The low-level API consists of only one function: `transpile`. It takes a TypeScript program, optional source files, and optional custom transformer and printer arguments, allowing you to override their default behavior first.

More information on extending the transformer and printer can be found here:

- [Custom LuaTransformer API](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Custom-LuaTransformer-API)
- [Custom LuaPrinter API](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Custom-LuaPrinter-API)

**Arguments:**

- program: ts.Program - The TypeScript program to transpile (note: unlike the high-level API, compilerOptions is part of the program and cannot be supplied separately).
- _[Optional]_ sourceFiles: ts.SourceFile[] - A collection of sourcefiles to transpile, `program.getSourceFiles()` by default.
- _[Optional]_ customTransformers: ts.CustomTransformers - Custom TypeScript transformers to apply before transpiling.
- _[Optional]_ transformer: tstl.LuaTransformer - If provided, this transformer is used instead of the default tstl transformer.
- _[Optional]_ printer: tstl.LuaPrinter - If provided, this printer is used instead of the default tstl printer.
- _[Optional]_ emitHost: tstl.EmitHost - Provides the methods for reading/writing files, useful in cases where you need something other than regular reading from disk. Defaults to `ts.sys`.

**Example:**

This example shows using the low-level API to override how array literals are transpiled. By default, array literals are transformed as follows: `(TS)[1, 2, 3] -> (Lua){1, 2, 3}`. This example extends and overrides the default transformer to instead transform like this: `(TS)[1, 2, 3] -> (Lua){1, 2, 3, n=3}`.

```ts
const options: tstl.CompilerOptions = { luaTarget: tstl.LuaTarget.Lua53 };
const program = ts.createProgram({ rootNames: ["file1.ts", "file2.ts"], options });

class CustomTransformer extends tstl.LuaTransformer {
  public transformArrayLiteral(expression: ts.ArrayLiteralExpression): tstl.ExpressionVisitResult {
    // Call the original transformArrayLiteral first, to get the default result.
    // You could also skip this and create your own table expression with tstl.createTableExpression()
    const result = super.transformArrayLiteral(expression) as tstl.TableExpression;

    // Create the 'n = <elements.length>' node
    const nIdentifier = tstl.createIdentifier("n");
    const nValue = tstl.createNumericLiteral(expression.elements.length);
    const tableField = tstl.createTableFieldExpression(nValue, nIdentifier);

    // Add the extra table field we created to the default transformation result
    if (result.fields === undefined) {
      result.fields = [];
    }
    result.fields.push(tableField);

    return result;
  }
}

const transformer = new CustomTransformer(program);
const printer = new tstl.LuaPrinter(options);

const result = tstl.transpile({
  program,
  transformer,
  printer,
});
console.log(result.diagnostics);
console.log(result.transpiledFiles);
// Emit result
console.log(tstl.emitTranspiledFiles(options, result5.transpiledFiles));
```
