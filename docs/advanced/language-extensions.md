---
title: Language extensions
---

import { SideBySide } from "@site/src/components/SideBySide";

TypeScriptToLua provides several extensions to the TypeScript language in the form of types and helper functions. To use these language extensions, add the types to your `tsconfig.json`:

```json
{
    "compilerOptions": {
        ...
        "types": ["typescript-to-lua/language-extensions"],
        ...
    },
}
```

## MultiReturn Type

This language extension allows typing of Lua functions that return multiple values. For example, consider Lua's `string.find`, it returns two indices: the start of the found substring and the end of the found substring. In TypeScript, functions can only return one value so a special type is needed to indicate to tstl there are multiple return values. This is the `MultiReturn<>` type.

It allows us to declare `string.find` like this:

```ts title=stringfind.ts
declare namespace string {
  export function find(haystack: string, needle: string): MultiReturn<[number, number]>;
}

const [start, end] = string.find("Hello, world!", "world");
```

Translating into:

```lua title=stringfind.lua
start, ____end = string.find("Hello, world!", "world")
```

:::note
Prefer MultiReturn over the similar [@tupleReturn annotation](./compiler-annotations.md#tuplereturn). MultiReturn can do anything tupleReturn can, with the added benefit of being able to distinguish between actual tuple tables and multiple return values in the type system.
:::

### \$multi

In order to create a function that returns multiple values it needs to return a `MultiReturn<>` type. This is where the `$multi` function comes in. Calling `$multi` in a return statement will create an instance of the `MultiReturn<>` type:

```ts title=multi.ts
function myFunc(): MultiReturn<[string, number]> {
  return $multi("foo", 4);
}

const [foo, four] = myFunc();
```

Translates into:

```lua title=multi.lua
function myFunc(self)
    return "foo", 4
end
foo, four = myFunc(nil)
```
