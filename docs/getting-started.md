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

Check out [Configuration](configuration.md) page for more information.

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
