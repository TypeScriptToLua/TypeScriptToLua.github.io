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

## LuaMultiReturn Type

This language extension allows typing of Lua functions that return multiple values. For example, consider Lua's `string.find`, it returns two indices: the start of the found substring and the end of the found substring. In TypeScript, functions can only return one value so a special type is needed to indicate to tstl there are multiple return values. This is the `LuaMultiReturn<>` type.

It allows us to declare `string.find` like this:

```ts title=stringfind.ts
declare namespace string {
  export function find(haystack: string, needle: string): LuaMultiReturn<[number, number]>;
}

const [start, end] = string.find("Hello, world!", "world");
```

Translating into:

```lua title=stringfind.lua
start, ____end = string.find("Hello, world!", "world")
```

:::note
Prefer LuaMultiReturn over the similar [@tupleReturn annotation](./compiler-annotations.md#tuplereturn). LuaMultiReturn can do anything tupleReturn can, with the added benefit of being able to distinguish between actual tuple tables and multiple return values in the type system.
:::

### $multi

In order to create a function that returns multiple values it needs to return a `LuaMultiReturn<>` type. This is where the `$multi` function comes in. Calling `$multi` in a return statement will create an instance of the `LuaMultiReturn<>` type:

```ts title=multi.ts
function myFunc(): LuaMultiReturn<[string, number]> {
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

## $range Iterator Function

Typescript's numeric for loops are less restrictive than Lua's, so they are transpiled into while loops instead. To create a Lua-style numeric for loop, you can use the `$range` language extension in a for...of loop.

Example:

<SideBySide>

<!-- prettier-ignore -->
```ts
for (const i of $range(1, 5)) {}
for (const i of $range(1, 10, 2)) {}
for (const i of $range(5, 1, -1)) {}
```

```lua
for i = 1, 5 do end
for i = 1, 10, 2 do end
for i = 5, 1, -1 do end
```

</SideBySide>

## LuaIterable Type

Iterators in Lua work quite differently than in Typescript/Javscript, so a special type is needed to use them.

For example, to declare and use a lua function that returns an iterator for a set of strings, you can do this:

<SideBySide>

```ts
declare function myIterator(): LuaIterable<string>;

for (const s of myIterator()) {
  console.log(s);
}
```

```lua
for s in myIterator() do
  print(s)
end
```

</SideBySide>

Some iterators return multiple values each iteration. To declare these, combine `LuaIterable` with [`LuaMultiReturn`](#luamultireturn-type):

<SideBySide>

```ts
declare function myIterator(): LuaIterable<LuaMultiReturn<[string, string]>>;

for (const [a, b] of myIterator()) {
  console.log(a, b);
}
```

```lua
for a, b in myIterator() do
  print(a, b)
end
```

</SideBySide>

Lua iterators support passing an invisible state object each iteration. If your iterator type does this, you can declare the state type as a second type parameter:

```ts
type MyStateType = ...
declare function myIterator(): LuaIterable<string, MyStateType>;
```

This is only really required if you need to use the iterator outside of a `for...of` loop.

```ts
let [iteratorFunction, state, lastValue] = myIterator();
while (true) {
  const value = iteratorFunction(state, lastValue);
  console.log(value);
  lastValue = value;
}
```

See the [Lua Reference Manual](https://www.lua.org/manual/5.3/manual.html#3.3.5) for more information on lua for loops.

## Operator Map Types

Lua supports overloading operators on types using [metatable methods](https://www.lua.org/manual/5.4/manual.html#2.4) such as `__add`. But, Javascript and Typescript do not support this. In order to use overloaded operators on types that support them, you can declare special mapping functions in TS that will translate to those operators in Lua.

A common example of an overloaded operator is addition of a mathematical vector type:

```ts
// Vector type supplied by a library, which supports math operators
declare interface Vector {
  x: number;
  y: number;
}

declare const a: Vector;
declare const b: Vector;
const result = a + b; // Not allowed in TS
```

To support addition for this type, you can declare a special function:

```ts
declare const addVector: LuaAddition<Vector, Vector, Vector>;
const result = addVector(a, b); // transpiles to 'result = a + b'
```

The mapping function does not have to be declared as global. For example, you could use declaration merging to declare it as a static function on `Vector`:

```ts
declare namespace Vector {
  export const add: LuaAddition<Vector, Vector, Vector>;
}

const result = Vector.add(a, b); // result = a + b
```

There are also special variants for the mapping types that allow you do declare operator overloads as methods:

```ts
declare interface Vector {
  add: LuaAdditionMethod<Vector, Vector>;
}
const result = a.add(b); // result = a + b
```

Some operators may have a different return type based on their inputs. You can support this by using intersection types. For example, our `Vector` type might overload the multiplication operator to scale by a number, or perform a dot product on two `Vectors`:

```ts
declare namespace Vector {
  export const mul: LuaMultiplication<Vector, Vector, number> & LuaMultiplication<Vector, number, Vector>;
}

const dot: number = Vector.mul(a, b);
const scaled: Vector = Vector.mul(a, 2);
```

### Supported Operators:

- Math operators
  - LuaAddition / LuaAdditionMethod (`a + b`)
  - LuaSubtraction / LuaSubtractionMethod (`a - b`)
  - LuaMultiplication / LuaMultiplicationMethod (`a * b`)
  - LuaDivision / LuaDivisionMethod (`a /b `)
  - LuaModulo / LuaModuloMethod (`a % b`)
  - LuaPower / LuaPowerMethod (`a ^ b`)
  - LuaFloorDivision / LuaFloorDivisionMethod (`a // b`, only when targeting Lua 5.3 or later)
  - LuaNegation / LuaNegationMethod (`-x`)
- Bitwise operators (only when targeting Lua 5.3 or later)
  - LuaBitwiseAnd / LuaBitwiseAndMethod (`a & b`)
  - LuaBitwiseOr / LuaBitwiseOrMethod (`a | b`)
  - LuaBitwiseExclusiveOr / LuaBitwiseExclusiveOrMethod (`a ^ b`)
  - LuaBitwiseLeftShift / LuaBitwiseLeftShiftMethod (`a << b`)
  - LuaBitwiseRightShift / LuaBitwiseRightShiftMethod (`a >> b`)
  - LuaBitwiseNot / LuaBitwiseNotMethod (`~x`)
- LuaConcat / LuaConcatMethod (`a .. b`)
- LuaLength / LuaLengthMethod (`#x`)
