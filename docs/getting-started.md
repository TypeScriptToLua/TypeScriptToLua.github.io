---
title: Getting Started
---

This is a quick introduction into project setup and our CLI.
For a TypeScript quick start please read: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html

## Installation

NPM users can run:

```bash
npm install -g typescript-to-lua
```

## Project Setup

We use the same configuration file that the vanilla TypeScript compiler `tsc` uses.
This file is called `tsconfig.json` and should be located in your projects root.

Example:

```json title=tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["esnext"],
    "strict": true
  },
  "tstl": {
    "luaTarget": "JIT"
  }
}
```

Because we use the same configuration system `tsc` uses, you can use most of the [options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) available for vanilla TS (including source maps!) with some [limitations](https://github.com/Perryvw/TypescriptToLua/wiki/Limitations#config--compileroptions).

In addition we add some Lua related options:

### TSTL specific options

| Option               | Values                                                               | Description                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `luaTarget`          | `"JIT"`, `"5.3"`, `"5.2"`, `"5.1"` (default: `"JIT"`)                | Specifies the Lua version you wan to generate code for.                                                                                                                      |
| `noImplicitSelf`     | `true`, `false` (default: `false`)                                   | If true, treats all project files as if they were prefixed with<br />`/** @noSelfInFile **/`.                                                                                |
| `noHeader`           | `true`, `false` (default: `false`)                                   | Set this to true if you don't want to include our header in the output.                                                                                                      |
| `luaLibImport`       | `"inline"`, `"require"`, `"always"`, `"none"` (default: `"require"`) | We polyfill certain JavaScript features with Lua functions, this option specifies how these functions are imported into the Lua output.                                      |
| `sourceMapTraceback` | `true`, `false` (default: `false`)                                   | Overrides Lua's `debug.traceback` to apply sourcemaps to Lua stacktraces. This will make error messages point to your original TypeScript code instead of the generated Lua. |
| `luaBundle`          | File path (relative to the `tsconfig.json`)                          | Will bundle all output lua files into a single bundle file. Requires **luaBundleEntry** to be set!                                                                           |
| `luaBundleEntry`     | File path (relative to the `tsconfig.json`)                          | This should be the name/path of the TS file in your project that will serve as entry point to the bundled code.                                                              |

**IMPORTANT** These options need to be set in the `tstl` object of your `tsconfig.json`, do not set them inside `compilerOptions` (see example above).

## Building your project

Our command line interface is called `tstl` and it works almost exactly as TypeScript's `tsc`, you can pass `tsc` options to `tstl`.

Example:

```bash
tstl -p pathToYour/tsconfig.json --luaTarget JIT --strict false
```

This command will build your project, overriding some options set in `tsconfig.json` (first example).

## Compiling files directly

Example:

```bash
tstl --luaTarget 5.1 --strict true script.ts
```

```bash
tstl --luaTarget 5.1 --strict true script1.ts someDir/script2.ts
```

## Further Reading

It's recommended to read the following articles, for more information on advanced usage and limitations of tstl.

- [Differences between Lua and JS](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Differences-between-Lua-and-Javascript)
- [Writing Declarations](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Writing-Declarations)
- [Compiler Directives](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Compiler-Directives)
- [Functions and the self Parameter](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Functions-and-the-self-Parameter)
- [Supported Lua Versions](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Supported-Lua-Versions)
- [Limitations](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Limitations)
