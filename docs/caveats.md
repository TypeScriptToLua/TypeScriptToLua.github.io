---
title: Caveats
---

## Feature support

| Feature             | Lua 5.0 | Lua 5.1 | Lua 5.2 | Lua 5.3 | LuaJIT |
| ------------------- | :-----: | :-----: | :-----: | :-----: | :----: |
| [Missing features]  |   ❌    |   ❌    |   ❌    |   ❌    |   ❌   |
| [Bitwise operators] |   ❌    |   ❌    |   ✔️    |   ✔️    |   ✔️   |
| [`continue`]        |   ❌    |   ❌    |   ✔️    |   ✔️    |   ✔️   |
| (everything else)   |   ✔️    |   ✔️    |   ✔️    |   ✔️    |   ✔️   |

[missing features]: https://github.com/TypeScriptToLua/TypeScriptToLua/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22missing+feature%22
[bitwise operators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
[`continue`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue

## Differences from JavaScript

This project aims for both compilation results to have the same behavior as much as possible, but not at all costs. Since TypeScript is based on JavaScript it also inherited some of the quirks in JavaScript that are not present in Lua. This is where behavior between Lua and JavaScript compilation targets diverge. TypeScriptToLua aims to keep identical behavior as long as **sane** TypeScript is used: if JavaScript-specific quirks are used behavior might differ.

Below are some of the cases where resulting Lua intentionally behaves different from compiled JS.

### Type-directed emit

One of TypeScript's [design goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals) is **not** using type information to affect program runtime behavior. Though this has many advantages (such as gradual typing), TypeScriptToLua uses type information extensively. This allows us to emit a much more optimized, portable, and correct Lua code.

### [Boolean coercion](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)

JavaScript and Lua differ in what they evaluate to true/false. TypeScriptToLua adheres to the Lua evaluations.

| TypeScript        | _JavaScript behavior_ | _Lua behavior_ |
| ----------------- | --------------------- | -------------- |
| `false`           | `false`               | `false`        |
| `undefined`       | `false`               | `false`        |
| `null`            | `false`               | `false`        |
| `NaN`             | `false`               | ⚠️`true`       |
| `""`              | `false`               | ⚠️`true`       |
| `0`               | `false`               | ⚠️`true`       |
| (Everything else) | `true`                | `true`         |

### [Loose equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Loose_equality_using)

TypeScriptToLua makes no difference between `==` and `===` when compiling to Lua, treating all comparisons as strict (`===`).

### Array Length

`Array.prototype.length` is translated to Lua's `#` operator. Due to the way lists are implemented in Lua there can be differences between JavaScript's `list.length` and Lua's `#list`. The transpiler does not do anything to remedy these differences, so when working with lists, the transpiled Lua will use the standard Lua conventions. Generally speaking, the situation where these differences occur happen when adding/removing items to a list in a hacky way, or when setting list items to `undefined`/`null`.

**Examples:**

**Safe (no difference):**

```ts
const myList = [1, 2, 3];
myList.push(4);
myList.pop();
myList.splice(1, 1);
// myList.length == 2
```

**Differences might occur:**

```ts
const myList = [1, 2, 3];
myList[1] = undefined;
// myList.length == 1 (3 in JavaScript)
```

```ts
const myList = [1, 2, 3];
myList[4] = 5;
// myList.length == 3 (5 in JavaScript)
```

### Key Iteration Order

Even though iterating over object keys with `for ... in` does not guarantee order in either JavaScript or Lua. Therefore, the iteration order in JavaScript is likely different from the order in Lua.

**Note:** If a specific order is required, it is better to use ordered collections like lists instead.

### Iterating an array with `for ... in`

Not allowed.

### Sorting

A sorting algorithm is [said to be stable](https://stackoverflow.com/questions/1517793/what-is-stability-in-sorting-algorithms-and-why-is-it-important) if two objects with equal keys appear in the same order in sorted output as they appear in the input array to be sorted.

- Sorting is part of the JavaScript standard library via the `Array.sort` method. It is guaraunteed to be [stable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
- Sorting is also part of the Lua standard library via the `table.sort` method. It is **not** guaraunteed to be [stable](https://www.lua.org/manual/5.3/manual.html#pdf-table.sort).

TypeScriptToLua relies on the Lua standard library for sorting. In other words, it transpiles `[1, 2, 3].sort();` to `table.sort({1, 2, 3})`. So beware that your sorts will no longer be stable!

If you need stable sorting, you have to manually use a custom sorting function. For some examples of this, see the [sorting helper functions from `isaacscript-common`](https://github.com/IsaacScript/isaacscript/blob/main/packages/isaacscript-common/src/functions/sort.ts).
