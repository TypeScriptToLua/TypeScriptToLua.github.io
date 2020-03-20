---
title: Caveats
---

## Feature support

| Feature             | Lua 5.1 | Lua 5.2 | Lua 5.3 | LuaJIT |
| ------------------- | :-----: | :-----: | :-----: | :----: |
| (Everything else)   |   ✔️    |   ✔️    |   ✔️    |   ✔️   |
| Bitwise operators   |   ❌    |   ✔️    |   ✔️    |   ✔️   |
| Switch statement    |   ❌    |   ✔️    |   ✔️    |   ✔️   |
| `continue`          |   ❌    |   ✔️    |   ✔️    |   ✔️   |
| `Promise`           |   ❌    |   ❌    |   ❌    |   ❌   |
| `async` / `await`   |   ❌    |   ❌    |   ❌    |   ❌   |
| Regular Expressions |   ❌    |   ❌    |   ❌    |   ❌   |
| Optional Chaining   |   ❌    |   ❌    |   ❌    |   ❌   |
| Nullish Coalescing  |   ❌    |   ❌    |   ❌    |   ❌   |

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
