---
title: Configuration
---

TypeScriptToLua uses the same configuration file as the vanilla TypeScript compiler, loading it from the `tsconfig.json` file using the same rules as `tsc`.

# Custom options

To customize transpilation behavior we add a new group of options to the `tsconfig.json` file. All of these options should be placed in a `tstl` object.

```json title=tsconfig.json
{
  "tstl": {
    // custom options
  }
}
```

| Option               | Values                                                               | Description                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `luaTarget`          | `"JIT"`, `"5.3"`, `"5.2"`, `"5.1"` (default: `"JIT"`)                | Specifies the Lua version you want to generate code for.                                                                                                                     |
| `noImplicitSelf`     | `true`, `false` (default: `false`)                                   | If true, treats all project files as if they were prefixed with<br />`/** @noSelfInFile **/`.                                                                                |
| `noHeader`           | `true`, `false` (default: `false`)                                   | Set this to true if you don't want to include our header in the output.                                                                                                      |
| `luaLibImport`       | `"inline"`, `"require"`, `"always"`, `"none"` (default: `"require"`) | We polyfill certain JavaScript features with Lua functions, this option specifies how these functions are imported into the Lua output.                                      |
| `sourceMapTraceback` | `true`, `false` (default: `false`)                                   | Overrides Lua's `debug.traceback` to apply sourcemaps to Lua stacktraces. This will make error messages point to your original TypeScript code instead of the generated Lua. |
| `luaBundle`          | File path (relative to the `tsconfig.json`)                          | Will bundle all output lua files into a single bundle file. Requires **luaBundleEntry** to be set!                                                                           |
| `luaBundleEntry`     | File path (relative to the `tsconfig.json`)                          | This should be the name/path of the TS file in your project that will serve as entry point to the bundled code.                                                              |

# Standard options

Most of the standard [TypeScript options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) work without any changes. Notable unsupported options are:

- `composite`, `build`
- `incremental`
- `emitDecoratorMetadata`
- `esModuleInterop`
- `jsx`

Some options do not apply to TypeScriptToLua and are ignored:

- `outFile` - use `luaBundle` instead.
- `importHelpers`, `noEmitHelpers` - use `luaLibImport` instead.
- `target`, `module` - it's only effect is limiting some features, so prefer to set it to `esnext`. If TypeScript requires you to specify different `module` type because you want to bundle your declarations with `outFile` and `declarations`, consider using [API Extractor](https://api-extractor.com/) instead.