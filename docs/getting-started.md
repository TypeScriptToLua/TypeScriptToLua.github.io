---
title: Getting Started
---

This page will help you set up a new TypeScript project that will be converted to Lua with TypeScriptToLua.

Note that we assume that you are already familiar with how TypeScript works. If you have never coded a project in TypeScript before, or you need a refresher, first read the [official TypeScript tutorial](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html).

## Installation

TypeScriptToLua is built using [Node.js](https://nodejs.org/) and distributed via [npm](https://www.npmjs.com/). To install it, you need to create a `package.json` file in the root of your project, containing at least `{}`. Then, you can add the latest version of TypeScriptToLua to your project:

```bash
npm install --save-dev typescript-to-lua typescript
```

(If you don't know the difference between the package managers, choose `npm`.)

:::note
Installing `tstl` locally is recommended to keep your build reproducible and prevent version conflicts between projects. However, it is also possible to install it globally with `npm install --global typescript-to-lua`.
:::

## Project setup

TypeScriptToLua is configured using a `tsconfig.json` file. (This is the same file used to configure vanilla TypeScript.) It should be located in your project's root.

### Basic Configuration

```json title=tsconfig.json
{
  "$schema": "https://raw.githubusercontent.com/TypeScriptToLua/TypeScriptToLua/master/tsconfig-schema.json",
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

Make sure to set the value of `luaTarget` to the Lua version of your environment. Valid values are `JIT`, `5.4`, `5.3`, `5.2`, `5.1`, `5.0`, and `universal`.

:::note
You can find out the version of your Lua environment by running: `print(_VERSION)`
:::

Check out [configuration page](configuration.md) for more information.

## Building your project

Our command line interface is called `tstl` and it works almost exactly the same as TypeScript's `tsc`.

Since `tstl` is installed locally to your project, you cannot run it as a bare command in your terminal. Instead, use:

```bash
npx tstl
```

:::note
The binary is installed to `node_modules/.bin/tstl`, so you can also run it directly from that path if needed. (But this is not recommended.)
:::

### npm scripts

You can also run `tstl` as an [npm script](https://docs.npmjs.com/misc/scripts). Using npm scripts for this sort of thing is idiomatic in JavaScript/TypeScript projects. This is accomplished by adding a `scripts` field to the `package.json` file:

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

Then, you can run the script like this:

```bash
# Build
npm run build

# Build and watch for changes
npm run dev
```

## Type Declarations

The best way to use TypeScript is to provide it with information about the format/types of the external functions and variables that you will be using (specific to your environment). This allows the compiler to check your code for mistakes when compiling, instead of having to run the code to find issues. To give TypeScript this information, you will need to provide it with type declarations. You can write these declarations yourself or, if available, install an existing type declarations package for your environment from npm.

For instructions on how to install type declaration packages, see the readme file for the individual package in question. In short, you need to install the package from npm, and then add the `types` field to the `compilerOptions` in the `tsconfig.json` file.

### Type Declaration Packages - Official

We provide an official type declaration package for [the Lua standard library](https://github.com/TypeScriptToLua/lua-types).

These declarations do not come with `tstl` by default because most of the time, you should not be using the Lua standard library directly. In other words, you can just write idiomatic TypeScript and `tstl` will convert things properly. (For example, it converts `Math.round` to `math.round`.) However, if you want to do some low-level Lua stuff and work with the Lua standard library, then you will need to install these type declarations so that the TypeScript compiler can understand what you are doing.

### Type Declaration Packages - Unofficial

Type declarations exist for some common Lua environments:

- [Defold Game Engine](https://github.com/ts-defold/types)
- [LÖVE 2D Game Engine](https://github.com/hazzard993/love-typescript-definitions)
- [Minetest](https://github.com/RepComm/mt-api)

Additionally, type declarations exist for some games:

- [The Binding of Isaac: Rebirth](https://isaacscript.github.io)
- [ComputerCraft (Minecraft)](https://github.com/MCJack123/cc-tstl-template)
- [Dota 2](https://github.com/ModDota/API/tree/master/declarations/server) ([template](https://github.com/ModDota/TypeScriptAddonTemplate))
- [Factorio](https://github.com/GlassBricks/typed-factorio)
- [Garry's Mod](https://github.com/lolleko/gmod-typescript)
- [Retro Gadget](https://github.com/DarkMio/retro-gadgets-typedefs) ([template](https://github.com/DarkMio/retro-gadgets-template))
- [Tabletop Simulator](https://github.com/stevenlafl/tts-typescript)
- [World of Warcraft](https://github.com/wartoshika/wow-declarations)
- [World of Warcraft Classic](https://github.com/wartoshika/wow-classic-declarations)

(If you have created type declarations for a new game, you can click on the "Edit this page" link below to add it to the list.)
