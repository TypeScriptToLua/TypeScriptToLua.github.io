---
title: External Lua Code
---

As of `0.40.0`, tstl supports module resolution for libraries, which means you can _use_ and _create_ npm packages containing `.lua` files. You can also include Lua source files directly into your source code.

## Adding Lua files to your project sources

You can simply add a Lua file as part of your project sources if you add [a declaration file](./advanced/writing-declarations.md) with the same name. You can then simply import the Lua code in your TypeScript.

Your project should look like:

```
project/
├── main.ts
├── someLua.lua
├── someLua.d.ts
└── tsconfig.json
```

```ts title=main.ts
import { foo, bar } from "./someLua";

foo();
bar();
```

```lua title=someLua.lua
local someLua = {}

function someLua:foo()
  print("hello")
end

function someLua:bar()
  print("world")
end

return someLua
```

```ts title=someLua.d.ts
export function foo(): void;
export function bar(): void;
```

## Importing Arrays

Building on the previous section, you might want also want to import a Lua array. For example:

```lua title=things.lua
return {
    {
        "foo": 123,
        "bar": 456,
    },
    {
        "foo": 789,
        "bar": 987,
    },
}
```

In normal TypeScript code that imports an array, you would typically use the `export default` functionality of ES6 imports. But you can't do that here, because Lua code has no import named `default`. Instead, you have to use `export =` syntax, like so:

```ts title=things.d.ts
interface Thing {
  foo: number;
  bar: number;
}

declare const things: Thing[];
export = things;
```

Then, in your TypeScript code, you can import it exactly like you would expect:

```ts title=main.ts
import contents from "./module";
```

Finally, note that for this to work, `esModuleInterop` must be specified as true in your `tsconfig.json` file.

For more information about this export syntax, see [the official TypeScript documentation](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require).

## Using NPM packages

To use a Lua package, install it via npm and use it as you would for any regular npm package in TypeScript. If the package does not include its own `.d.ts` declaration files, you can create your own by adding a `<package name>.d.ts` [declaration file](./advanced/writing-declarations.md) to your source files.

:::note
Including TS or JS files from npm packages is currently NOT supported.
:::
