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

### Local Variable Limit

In most cases, TSTL creates Lua code that declares variables using the `local` keyword, which makes the variables local to the function or block. In other words:

```ts
const foo = 123;
```

Usually gets transpiled to:

```lua
local foo = 123
```

In JavaScript/TypeScript, there is no limit to the amount of variables that you can create. However, in Lua, there is a limit of 200 local variables at any point in time. For big TSTL programs, this can be a problem, causing a run-time error in production that the compiler will not catch!

For example, imagine that a TSTL program consists of 101 individual features that are separated out into different feature classes, each in their own separate file. And upon program startup, all of the classes are instantiated:

```ts title=main.ts
import { Feature1 } from "./features/Feature1";
import { Feature2 } from "./features/Feature2";
import { Feature3 } from "./features/Feature3";
...
import { Feature101 } from "./features/Feature101";

const FEATURE_CLASSES = [
  Feature1,
  Feature2,
  Feature3,
  ...,
  Feature101,
];

for (const featureClass of FEATURE_CLASSES) {
  new featureClass();
}
```

Since each transpiled import statement creates two separate local variables, this would create 202 local variables, and the program would immediately crash upon first being loaded.

You can solve this problem in a few different ways. For this specific pattern, we recommend using a [barrel file](https://basarat.gitbook.io/typescript/main-1/barrel), which is a file that contains only imports and exports. Specifically, our fixed program would look like this:

```ts title=featureClasses.ts
export { Feature1 } from "./features/Feature1";
export { Feature2 } from "./features/Feature1";
export { Feature3 } from "./features/Feature1";
...
export { Feature101 } from "./features/Feature101";
```

```ts title=main.ts
import * as fc from "./featureClasses.ts";

const FEATURE_CLASSES = [
  fc.Feature1,
  fc.Feature2,
  fc.Feature3,
  ...,
  fc.Feature101,
];

for (const featureClass of FEATURE_CLASSES) {
  new featureClass();
}
```

Importatly, once we have a barrel file, we do not have to artificially split up the number of classes. This is because TSTL does not transpile exports with any local variables at all. Thus, we can have an unlimited number of exports inside of the barrel file without ever hitting the Lua local variable limit.
