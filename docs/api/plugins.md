---
title: Plugins
---

TypeScriptToLua supports plugins - an interface that allows to customize transpilation behavior.

To add a plugin you have to add it under `tstl.luaPlugins` option in the [configuration file](../configuration.md).

Example:

```json title=tsconfig.json
{
  "tstl": {
    "luaPlugins": [
      // Plugin is a JavaScript module exporting an object
      { "name": "./plugin1.js" },
      // TypeScriptToLua can load plugins written in TypeScript using `ts-node`
      { "name": "./plugin2.ts" },
      // Plugins can be published to npm
      { "name": "tstl-plugin-3" }
    ]
  }
}
```

## API

### `visitors`

Internally, to process [Abstract Syntax Tree](https://basarat.gitbook.io/typescript/overview/ast) of a TypeScript program, TypeScriptToLua implements the [visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern). Visitor is a function, called with a processed node and transformation context, and returning a Lua AST node. Plugins can inject their own visitors using `visitors` property, overriding standard transformation behavior.

Example:

```ts
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const plugin: tstl.Plugin = {
  // `visitors` is a record where keys are TypeScript node syntax kinds
  visitors: {
    // Visitor can be a function that returns Lua AST node
    [ts.SyntaxKind.ReturnStatement]: () => tstl.createReturnStatement([tstl.createBooleanLiteral(true)]),
  },
};

export default plugin;
```

Example 2:

```ts
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const plugin: tstl.Plugin = {
  visitors: {
    // Visit string literals, if original transformer returns a string literal, change the string to "bar" instead
    [ts.SyntaxKind.StringLiteral]: (node, context) => {
      // `context` exposes `superTransform*` methods, that can be used to call either the visitor provided by previous
      // plugin, or a standard TypeScriptToLua visitor
      const result = context.superTransformExpression(node);

      // Standard visitor for ts.StringLiteral always returns tstl.StringLiteral node
      if (tstl.isStringLiteral(result)) {
        result.value = "bar";
      }

      return result;
    },
  },
};

export default plugin;
```

### `printer`

`printer` is a function that overrides the standard implementation of the Lua AST printer. It receives some information about the file and the transformed Lua AST. See the [LuaPrinter](printer.md) page for more information.

Example:

```ts
import { SourceNode } from "source-map";
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const CUSTOM_COMMENT_HEADER = "-- This code was generated with a custom plugin!\n";

class CustomPrinter extends tstl.LuaPrinter {
  /* Override printFile */
  protected printFile(file: tstl.File): SourceNode {
    const originalResult = super.printFile(file);
    // Add header comment at the top of the file
    return this.createSourceNode(file, [`${CUSTOM_COMMENT_HEADER} ${this.luaFile}\n`, originalResult]);
  }

  /* Override printBoolean */
  public printBooleanLiteral(expression: tstl.BooleanLiteral): SourceNode {
    // Print any boolean as 'true'
    return this.createSourceNode(expression, "true");
  }
}

const plugin: tstl.Plugin = {
  printer: (program: ts.Program, emitHost: tstl.EmitHost, fileName: string, file: tstl.File) =>
    new CustomPrinter(emitHost, program, fileName).print(file),
};

export default plugin;
```

### `beforeTransform`

The `beforeTransform` function on plugins is called after gathering the TypeScript program and compiler options, but before any transformation to Lua is done.

It can be used to set up the plugin

```ts
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

class Plugin implements tstl.Plugin {
  public beforeTransform(program: ts.Program, options: tstl.CompilerOptions, emitHost: tstl.EmitHost) {
    console.log("Starting transformation of program", program, "with options", options);
  }
}

const plugin = new Plugin();
export default plugin;
```

### `afterPrint`

The `afterPrint` function is called _after_ tstl has translated the input program to Lua, but before resolving dependencies and before bundling if configured. You can use this to modify the list of output files and do direct string modifications to them.

```ts
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const plugin: tstl.Plugin = {
  afterPrint(
    program: ts.Program,
    options: tstl.CompilerOptions,
    emitHost: tstl.EmitHost,
    result: tstl.ProcessedFile[],
  ) {
    for (const file of result) {
      file.code = "-- Comment added by afterPrint plugin\n" + file.code;
    }
  },
};

export default plugin;
```

### `beforeEmit`

The `beforeEmit` function is called after the input program has been translated to Lua, after external dependencies have been resolved and included, and after bundling (if configured).

```ts
import * as ts from "typescript";
import * as tstl from "typescript-to-lua";

const plugin: tstl.Plugin = {
  beforeEmit(program: ts.Program, options: tstl.CompilerOptions, emitHost: tstl.EmitHost, result: tstl.EmitFile[]) {
    void program;
    void options;
    void emitHost;

    for (const file of result) {
      file.code = "-- Comment added by beforeEmit plugin\n" + file.code;
    }
  },
};

export default plugin;
```
