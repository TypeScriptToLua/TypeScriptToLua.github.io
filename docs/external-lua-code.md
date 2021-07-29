---
title: External Lua Code
---

As of `0.40.0`, tstl supports module resolution for libraries, which means you can _use_ and _create_ npm packages containing `.lua` files. You can also include Lua source files directly into your source code.

## Adding Lua files to your project sources

You can simply add a Lua file as part of your project sources if you add [a declaration file](./advanced/writing-declarations.md) with the same name. You can then simply import the Lua code in your TypeScript.

Your project should look like:

```
main.ts
somelua.lua
somelua.d.ts
tsconfig.json
```

And you can use it like so:

```ts title=main.ts
import { myFunction } from "./somelua";

myFunction();
```
