---
title: Language Extensions
---

import { SideBySide } from "@site/src/components/SideBySide";

TypeScriptToLua provides several extensions to the TypeScript language in the form of types and helper functions. To use these language extensions, add the types to your `tsconfig.json`:

```json title=tsconfig.json
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

TypeScript's numeric for loops are less restrictive than Lua's, so they are transpiled into while loops instead. To create a Lua-style numeric for loop, you can use the `$range` language extension in a for...of loop.

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

Iterators in Lua work quite differently than in TypeScript/JavaScript, so a special type is needed to use them.

For example, to declare and use a Lua function that returns an iterator for a set of strings, you can do this:

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

See the [Lua Reference Manual](https://www.lua.org/manual/5.3/manual.html#3.3.5) for more information on Lua for loops.

## LuaPairsIterable Type

Some types can be iterated with `pairs()` (for example, if the `__pairs` method is set in their metatable). These can be iterated without explicitly calling `pairs` by extending them from `LuaPairsIterable`.

<SideBySide>

```ts
interface MyType extends LuaPairsIterable<number, string> {}
declare const obj: MyType;

for (const [key, value] of obj) {
  console.log(key, value);
}
```

```lua
for key, value in pairs(obj) do
  print(key, value)
end
```

</SideBySide>

## Operator Map Types

Lua supports overloading operators on types using [metatable methods](https://www.lua.org/manual/5.4/manual.html#2.4) such as `__add`. But, JavaScript and TypeScript do not support this. In order to use overloaded operators on types that support them, you can declare special mapping functions in TS that will translate to those operators in Lua.

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
  - LuaDivision / LuaDivisionMethod (`a / b `)
  - LuaModulo / LuaModuloMethod (`a % b`)
  - LuaPower / LuaPowerMethod (`a ^ b`)
  - LuaFloorDivision / LuaFloorDivisionMethod (`a // b`, only when targeting Lua 5.3 or later)
  - LuaNegation / LuaNegationMethod (`-x`)
- Bitwise operators (only when targeting Lua 5.3 or later)
  - LuaBitwiseAnd / LuaBitwiseAndMethod (`a & b`)
  - LuaBitwiseOr / LuaBitwiseOrMethod (`a | b`)
  - LuaBitwiseExclusiveOr / LuaBitwiseExclusiveOrMethod (`a ~ b`)
  - LuaBitwiseLeftShift / LuaBitwiseLeftShiftMethod (`a << b`)
  - LuaBitwiseRightShift / LuaBitwiseRightShiftMethod (`a >> b`)
  - LuaBitwiseNot / LuaBitwiseNotMethod (`~x`)
- LuaConcat / LuaConcatMethod (`a .. b`)
- LuaLength / LuaLengthMethod (`#x`)

:::note
You can also map functions to table accessors (`__index` and `__newindex`). See [Lua Table Types](#lua-table-types).
:::

## Lua Table Types

The `LuaTable` type is provided to allow direct creation and manipulation of Lua tables. This is useful if you want to use a table that uses types other than string for its keys, as that is not supported by TypeScript. Calls to lua method tables are translated to simple lua:

- `table.get(key)` Get a value by key -> `table[key]`
- `table.set(key, value)` Set a value for key -> `table[key] = value`
- `table.has(key)` Check if key is in table -> `table[key] ~= nil`
- `table.delete(key)` Remove key (and its value) from table -> `table[key] = nil`

### Generic key and value types

`LuaTable` can be used without explicitly providing types for the keys and values, but also allows you to specify the type of keys and values in the table:

```ts
const typedLuaTable = new LuaTable<KeyType, ValueType>();
const untypedLuaTable = new LuaTable(); // Same as LuaTable<AnyNotNil, any>
```

### Getting and Setting

Calls to `get` and `set` on the table will transpile directly to `value = table[key]` and `table[key] = value`.

Example:

<SideBySide>

```ts
const tbl = new LuaTable();

tbl.set("foo", "bar");
console.log(tbl.get("foo"));

const objectKey = {};
tbl.set(objectKey, "baz");
console.log(tbl.get(objectKey));

tbl.set(1, "bah");
console.log(tbl.length());
```

```lua
tbl = {}

tbl.foo = "bar"
print(tbl.foo)

objectKey = {}
tbl[objectKey] = "baz"
print(tbl[objectKey])

tbl[1] = "bah"
print(#tbl)
```

</SideBySide>

### Iterating

To iterate over a `LuaTable`, use `for...of`. This will generate a `for...in` statement using `pairs()`.

<SideBySide>

```ts
const tbl = new LuaTable<number, string>();

tbl.set(3, "bar");
tbl.set(4, "bar");
tbl.set(5, "bar");

for (const [key, value] of tbl) {
  console.log(key);
  console.log(value);
}
```

```lua
tbl = {}

tbl[3] = "bar"
tbl[4] = "bar"
tbl[5] = "bar"

for key, value in pairs(tbl) do
  print(key)
  print(value)
end
```

</SideBySide>

(Remember that in Lua, `pairs()` returns the keys in a random order.)

### Custom Getters and Setters

If you have a type that uses non-string keys, you can use `LuaTableGet` and `LuaTableSet` function types to declare your own getters & setters, similar to [Operator Map Types](#operator-map-types).

Example:

<SideBySide>

```ts
interface Id {
  idStr: string;
}

interface IdDictionary {
  get: LuaTableGetMethod<Id, string>;
  set: LuaTableSetMethod<Id, string>;
}

declare const dict: IdDictionary;
const id: Id = { idStr: "foo" };
dict.set(id, "bar");
console.log(dict.get(id));
```

```lua
id = {idStr = "foo"}
dict[id] = "bar"
print(dict[id])
```

</SideBySide>

That example uses the `Method` versions of `LuaTableGet` and `LuaTableSet`. There are also stand-alone versions.

Example:

```ts
declare const idGet: LuaTableGet<IdDictionary, Id, string>;
declare const idSet: LuaTableSet<IdDictionary, Id, string>;
idSet(dict, id, "bar");
console.log(idGet(dict, id));
```

```ts
declare namespace IdDictionary {
  export const get: LuaTableGet<IdDictionary, Id, string>;
  export const set: LuaTableSet<IdDictionary, Id, string>;
}
IdDictionary.set(dict, id, "bar");
console.log(IdDictionary.get(dict, id));
```

### All custom LuaTable functions

There are more LuaTable functions other than `LuaTableGet` and `LuaTableSet` that you can use:

- `LuaTableGet` - Standalone function that gets a value by key from a table.
- `LuaTableGetMethod` - Method that gets a value by key from the table containing this method.
- `LuaTableSet` - Standlone function that sets a value to a key in a table.
- `LuaTableSetMethod` - Method that sets a value to a key in the table containing this method.
- `LuaTableHas` - Standalone function that checks if a key is present in a table.
- `LuaTableHasMethod` - Method that checks if a key is present in the table containing this method.
- `LuaTableDelete` - Standalone function that removes a key and its value from a table.
- `LuaTableDeleteMethod` - Method that removes a key and its value from table containing this method.

## $vararg Constant

Lua allows use of the ellipsis operator (`...`) to access command line arguments passed when executing a script file. To access this from TypeScript, you can use the `$vararg` constant in a spread expression.

Example:

<SideBySide>

```ts
console.log(...$vararg);
```

```lua
print(...)
```

</SideBySide>

When run:

<SideBySide>

```
> lua myscript.lua foo bar
```

```
foo     bar
```

</SideBySide>

Use of `$vararg` is only allowed at file scope, and only in a spread expression (`...$vararg`).
