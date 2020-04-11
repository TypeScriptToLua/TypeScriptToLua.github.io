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

Printer is a function that overrides standard implementation of Lua AST printer. It receives some information about the file and transformed Lua AST. See [Printer](printer.md) page for more information.

Example:

```ts
import * as tstl from "typescript-to-lua";

class CustomLuaPrinter extends tstl.LuaPrinter {}

const plugin: tstl.Plugin = {
  printer: (program, emitHost, fileName, block, luaLibFeatures) =>
    new CustomLuaPrinter(program.getCompilerOptions(), emitHost, fileName).print(block, luaLibFeatures),
};

export default plugin;
```
