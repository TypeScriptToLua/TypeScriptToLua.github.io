---
title: External Code
---

In your `tstl` project, you might want to use some existing Lua code. Or you might want to import a Lua library from [npm](https://www.npmjs.com/). This page describes how to use external Lua with your TypeScript code and TSTL.

:::note
This page is about importing code that **actually executes something**. In a `tstl` project, it is common to depend on external library that provide type declarations. Type declaration libraries only provide types: they do not contribute any code to your actual program output. Thus, they work a little differently from what is discussed on this page. For information on how type declarations work, see the [type declarations page](advanced/writing-declarations.md).
:::

## Adding Lua files to your project sources

The most straightforward way to add Lua code is to put the Lua file directly next to your TypeScript files. Next, you add [a declaration file](advanced/writing-declarations.md) with the same name. Then, you can import the Lua code in your TypeScript.

For example, a project might look like this:

```text
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

## Importing a Lua module that only exports an array

Building on the previous section, you might want also want to import a Lua file that exports an array. For example, something like:

```lua title=things.lua
return {
    {
        foo = 123,
        bar = 456,
    },
    {
        foo = 789,
        bar = 987,
    },
}
```

Writing a definitions file for this is tricky, since the Lua file has no named imports and no default export. Here, you have to use `export =` syntax, like so:

```ts title=things.d.ts
interface Thing {
  foo: number;
  bar: number;
}

declare const things: Thing[];
export = things;
```

Then, in your TypeScript code, you can import it like:

```ts title=main.ts
import * as things from "./module";

print(things[0].foo); // Prints "123"
```

For more information about this export syntax, see [the official TypeScript documentation](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require).

## Importing Lua packages from npm

`tstl` supports module resolution for libraries, which means you can _use_ and _create_ npm packages containing `.lua` files. (Most packages on npm contain JavaScript files, but npm allows you to create packages with whatever kinds of files you want.)

### Using Lua packages

To use a Lua package, install it via npm and use it in the same way that you would in a normal TypeScript project. In other words:

```sh
# If you use npm:
npm install foo --save

# If you use yarn:
yarn add foo

# If you use pnpm:
pnpm add foo
```

And then use it in your code:

```ts
import { someFunction } from "foo";

someFunction();
```

Since the npm package was presumably made for `tstl` users, it will almost certainly include `.d.ts` files alongside the `.lua` files, which is necessary for `tstl` to import the Lua files properly. If there are no `.d.ts` files, you can try [creating some for the package yourself](advanced/writing-declarations.md).

### Creating Lua packages

For more information on creating a Lua package yourself, see [the page on publishing modules](publishing-modules.md).

## Importing JavaScript or TypeScript packages from npm

**Importing JavaScript or TypeScript packages from npm will not work.** This means that it is impossible to use common JavaScript/TypeScript libraries like [Underscore.js](https://underscorejs.org/) and so on.

(It is not possible for `tstl` to work with a generic npm package because most TypeScript libraries only publish the compiled JavaScript to npm. And `tstl` can't convert JavaScript to Lua because it needs the type information to create correct code. For example, `tstl` needs to be able to distinguish between arrays and objects in order to write the correct index.)

As a workaround, you can copy paste TypeScript code from a package repository directly into your project. (That way, it will be compiled by `tstl` alongside your normal code.)

Alternatively, you could fork an existing package and re-publish it as Lua files (instead of JavaScript) so that it can be directly consumed by other `tstl` projects. However, doing this kind of thing will only work for really basic packages, since you would have to also fork all of the dependencies and convert those to Lua as well.

Obviously, `tstl` programs will not have access to any of the Node.js standard libraries or APIs (like e.g. `import path from "path";`), so make sure that any code that you integrate into your project is not Node-specific.
