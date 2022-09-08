---
title: Configuration
---

TypeScriptToLua uses the same configuration file as the vanilla TypeScript compiler, loading it from the `tsconfig.json` file using the same rules as `tsc`.

## Custom options

To customize transpilation behavior we add a new group of options to the `tsconfig.json` file. All of these options should be placed in a `tstl` object.

You can use our [VS Code extension](editor-support.md) or manually specify the JSON schema to receive autocompletion and hints for the configuration file.

```json title=tsconfig.json
{
  // Optional: Schema file for hints and validation
  "$schema": "https://raw.githubusercontent.com/TypeScriptToLua/vscode-typescript-to-lua/master/tsconfig-schema.json",

  // ... tsconfig options

  "tstl": {
    // Custom options
  }
}
```

| Option                           | Values                                                                              | Description                                                                                                                                                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buildMode`                      | `"default"`, `"library"` (default: `"library"`)                                     | Use `buildMode: "library"` to build [publishable library packages](publishing-modules.md).                                                                                                                                                                                                      |
| `extension`                      | File extension (default: `".lua"`)                                                  | Extension of emitted lua files.                                                                                                                                                                                                                                                                 |
| `luaTarget`                      | `"JIT"`, `"5.3"`, `"5.2"`, `"5.1"`, `"universal"`, `"5.0"` (default: `"universal"`) | Specifies the Lua version you want to generate code for. Choosing `universal` makes TypeScriptToLua generate code compatible with all supported Lua targets, except for Lua 5.0, which features an unique syntax not compatible with that of the other targets.                                 |
| `noImplicitGlobalVariables`      | `true`, `false` (default: `false`)                                                  | If true, always makes root level function and variable declarations local, even if not in a module (would be global in TypeScript).                                                                                                                                                             |
| `noImplicitSelf`                 | `true`, `false` (default: `false`)                                                  | If true, treats all project files as if they were prefixed with<br />`/** @noSelfInFile **/`.                                                                                                                                                                                                   |
| `noHeader`                       | `true`, `false` (default: `false`)                                                  | Set this to true if you don't want to include our header in the output.                                                                                                                                                                                                                         |
| `lua51AllowTryCatchInAsyncAwait` | `true`, `false` (default: `false`)                                                  | Disable warning diagnostic about try/catch inside `async` functions for Lua 5.1, in case you are using a modified 5.1 environment that can handle this.                                                                                                                                         |
| `luaLibImport`                   | `"inline"`, `"require"`, `"none"` (default: `"require"`)                            | We polyfill certain JavaScript features with Lua functions, this option specifies how these functions are imported into the Lua output. `"inline"`: Inline used functions in code; `"require"`: Require full lualib bundle if used in file. `"none"`: Never require/inline any lualib features. |
| `sourceMapTraceback`             | `true`, `false` (default: `false`)                                                  | Overrides Lua's `debug.traceback` to apply sourcemaps to Lua stacktraces. This will make error messages point to your original TypeScript code instead of the generated Lua.                                                                                                                    |
| `luaBundle`                      | File path (relative to the `tsconfig.json`)                                         | Will bundle all output lua files into a single bundle file. Requires **luaBundleEntry** to be set!                                                                                                                                                                                              |
| `luaBundleEntry`                 | File path (relative to the `tsconfig.json`)                                         | This should be the name/path of the TS file in your project that will serve as entry point to the bundled code.                                                                                                                                                                                 |
| `luaPlugins`                     | `Array<{ name: string; import?: string }>`                                          | List of [TypeScriptToLua plugins](api/plugins.md).                                                                                                                                                                                                                                              |
| `tstlVerbose`                    | `true`, `false` (default: `false`)                                                  | Output additional logging when performing a tstl build, to help diagnose issues.                                                                                                                                                                                                                |
| `noResolvePaths`                 | `Array<string>`                                                                     | An array of require paths that will **NOT** be resolved. For example `["require1", "sub.require2"]` will stop tstl from trying to resolve Lua sources for `require("require1")` and `require("sub.require2")`.                                                                                  |

## Standard options

Most of the standard [TypeScript options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) work without any changes. Notable unsupported options are:

- `composite`, `build`
- `incremental`
- `emitDecoratorMetadata`
- `esModuleInterop`

Some options do not apply to TypeScriptToLua and are ignored:

- `outFile` - use `luaBundle` instead.
- `importHelpers`, `noEmitHelpers` - use `luaLibImport` instead.
- `target`, `module` - it's only effect is limiting some features, so prefer to set it to `esnext`. If TypeScript requires you to specify different `module` type because you want to bundle your declarations with `outFile`, consider using [API Extractor](https://api-extractor.com/) instead.

## Transformers

Transformers is a powerful feature of TypeScript that allows you to modify behavior of your program during compilation. While TypeScript [currently](https://github.com/microsoft/TypeScript/issues/14419) does not provide a user-facing way to use transformers, TypeScriptToLua allows you to specify them in the configuration file, following [ttypescript](https://github.com/cevek/ttypescript#how-to-use) format.

**Example:**

```json title=tsconfig.json
{
  "compilerOptions": {
    "plugins": [{ "transform": "dota-lua-types/transformer" }]
  }
}
```
