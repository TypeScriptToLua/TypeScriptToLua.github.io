---
title: Plugins
---

TypeScriptToLua allows to customize transpilation behavior using plugins.

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

Example:

```ts
import * as tstl from "typescript-to-lua";

const plugin: tstl.Plugin = {
  // Printer is a function that can be used to override standard Lua AST printer
  // It receives some information about the file and the transformed Lua AST
  printer: (program, emitHost, fileName, ...args) => {
    // You can get original printer result by constructing `LuaPrinter` and calling `print` method
    const result = new tstl.LuaPrinter(program.getCompilerOptions(), emitHost, fileName).print(...args);
    result.code = `-- Plugin\n${result.code}`;
    return result;
  },
};

export default plugin;
```
