---
title: Getting Started
---

This is a quick introduction into project setup and our CLI. For a TypeScript quick start please read: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html

## Installation

TypeScriptToLua is built using [Node.js](https://nodejs.org/) and distributed via [npm](https://www.npmjs.com/). To install it, you need to create a `package.json` file in the root of your project, containing at least `{}`. Then you can use this command to add the latest version of TypeScriptToLua to your project:

```bash
npm install -D typescript-to-lua
```

:::note
Installing `tstl` locally is recommended to keep your build reproducible and prevent version conflicts between projects. However, it is also possible to install it globally with `npm install --global typescript-to-lua` or run it without install using `npx typescript-to-lua`.
:::

## Project setup

TypeScriptToLua shares the configuration format with vanilla TypeScript. This file is called `tsconfig.json` and should be located in your project's root.

Basic recommended configuration:

```json title=tsconfig.json
{
  // For reference, all TypeScript compiler options can be found at:
  // https://www.typescriptlang.org/docs/handbook/compiler-options.html
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "Node",
    "types": [],
    "strict": true
  },
  "tstl": {
    "luaTarget": "JIT"
  }
}
```

Check out [Configuration](configuration.md) page for more information.

## Building your project

Our command line interface is called `tstl` and it works almost exactly as TypeScript's `tsc`.

Since `tstl` is installed locally to your project, you cannot run it as a bare command in your terminal, so it's recommended to use it with [npm scripts](https://docs.npmjs.com/misc/scripts).

```json title=package.json
{
  "private": true,
  "scripts": {
    "build": "tstl",
    "dev": "tstl --watch"
  },
  "devDependencies": {
    "typescript-to-lua": "..."
  }
}
```

```bash
# Build
npm run build

# Build and watch for changes
npm run dev
```

:::note
For testing purposes you also can run `tstl` directly from your terminal with `node_modules/.bin/tstl` or `npx --no-install tstl`.
:::

## Declarations

The real power of this transpiler is usage together with good declarations for the Lua API provided. Some examples of Lua interface declarations can be found here:

- [Lua Standard Library](https://github.com/TypeScriptToLua/lua-types)
- [Dota 2 Custom Games](https://github.com/ModDota/API/tree/master/declarations/server) ([template](https://github.com/ModDota/TypeScriptAddonTemplate))
- [Defold Game Engine Scripting](https://github.com/dasannikov/DefoldTypeScript/blob/master/defold.d.ts)
- [LÖVE 2D Game Development](https://github.com/hazzard993/love-typescript-definitions)
- [World of Warcraft - Addon Development](https://github.com/wartoshika/wow-declarations)
- [World of Warcraft Classic - Addon Development](https://github.com/wartoshika/wow-classic-declarations)
