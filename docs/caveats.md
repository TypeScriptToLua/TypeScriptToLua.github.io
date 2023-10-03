---
title: Caveats
---

TSTL aims to support almost all modern, idiomatic TypeScript without any modifications. In other words, you probably will not have to worry about the idiomatic quirks of Lua or other internal decisions that TSTL makes when converting code.

With that said, TSTL does have some "gotchas" that you might run into. This page covers some of those edge-cases.

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

This project aims for JavaScript and Lua compilation results to have the same runtime behavior as much as possible, but not at all costs. Since TypeScript is based on JavaScript, it also inherited some of the quirks in JavaScript that are not present in Lua. This is where behavior between Lua and JavaScript compilation targets diverge. TypeScriptToLua aims to keep identical behavior as long as **sane** TypeScript is used: if JavaScript-specific quirks are used, behavior might differ.

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

We recommend that you use the [`strict-boolean-expression`](https://typescript-eslint.io/rules/strict-boolean-expressions/) ESLint rule in your TSTL projects, which will force you to be explicit and prevent this class of bug entirely.

### [Loose equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Loose_equality_using)

TypeScriptToLua makes no difference between `==` and `===` when compiling to Lua, treating all comparisons as strict (`===`).

We recommend that you use the [`eqeqeq`](https://eslint.org/docs/latest/rules/eqeqeq) ESLint rule, which will force you to be explicit and prevent this class of bug entirely.

### `undefined` and `null`

`nil` is the Lua equivalent for `undefined`, so TSTL converts `undefined` to `nil`. However, there is no Lua equivlanet for `null`, so TSTL converts `null` to `nil` as well.

In most TypeScript programs, you can use `null` and `undefined` interchangably. For this reason, we recommend keeping `null` out of your TSTL codebases in favor of `undefined`. Not only will this represent the transpiled Lua code better, but [it is more idiomatic in TypeScript to prefer `undefined` over `null` when both would accomplish the same thing](https://basarat.gitbook.io/typescript/recap/null-undefined).

### Table Key Deletion & Existence

In JavaScript, object keys can exist with any value, including `undefined` and `null`. For example:

```js
const foo = {};
foo.someProp1 = 123;
foo.someProp2 = undefined;
foo.someProp3 = null;
for (const key of Object.keys(foo)) {
  console.log(key);
}
```

This code will print out all 3 keys. In JavaScript, if you want to get rid of an object key, then you have to use the special `delete` operator (e.g. `delete foo.someProp3`).

Lua does not have a special `delete` operator. Instead, in Lua, table keys are deleted by assigning a value of `nil` to the key (e.g. `foo.someProp3 = nil`). Since both `undefined` and `null` transpile to `nil`, this means that if we ran the above code in a TSTL program, instead of printing out all 3 keys, only the first key would be printed out.

In most cases, this difference should not cause any problems. However, if you are using `null` or `undefined` to represent an initialized zero-value inside of your object, and then you need to read the keys of that object later on, then you will have a problem. To work around this, you could use a value of `-1` or `"__TSTL_NULL"` instead of `null`. (You could also use something like `const Null = {}`.)

### Array Length

`Array.prototype.length` is translated to Lua's `#` operator. Due to the way arrays are implemented in Lua, there can be differences between JavaScript's `myArray.length` and Lua's `#myArray`. The transpiler does not do anything to remedy these differences. Thus, when working with arrays, the transpiled Lua will use the standard Lua conventions. Generally speaking, the situation where these differences occur happen when adding/removing items to an array in a hacky way, or when setting array items to `undefined` / `null`.

For example:

#### Safe (no difference)

```ts
const myArray = [1, 2, 3];
myArray.push(4);
myArray.pop();
myArray.splice(1, 1);
// myArray.length == 2
```

#### Differences might occur

```ts
const myArray = [1, 2, 3];
myArray[1] = undefined;
// myArray.length == 1 (which would be 3 in JavaScript)
```

```ts
const myArray = [1, 2, 3];
myArray[4] = 5;
// myArray.length == 3 (which would be 5 in JavaScript)
```

### Key Iteration Order

Even though iterating over object keys with `for ... in` does not guarantee order in either JavaScript or Lua. Therefore, the iteration order in JavaScript is likely different from the order in Lua.

**Note:** If a specific order is required, it is better to use ordered collections like arrays instead.

### Array.fill 'end' parameter

In the ECMAScript spec for [Array.prototype.fill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill) is stated that if `end >= array.length`, then array.length is used instead. In Lua, the concept of array length is a bit more complex (see [Array Length](#array-length)). Therefore we decided to use just fill the array until the end index - whatever is provided - regardless of the original array length.

As a bonus this serves as a standin for the creation of an array of a specific length via `new Array(length)` (not implemented). With this modification to `Array.fill`, you can instead use `([] as number[]).fill(defaultValue, 0, length)`.

```ts
// const myNewArray = new Array(5); - new Array is not supported by typescript-to-lua

// Instead, use:

const myNewArray2 = ([] as number[]).fill(0, 0, 5); // Using this will create an array with 5 0's
```

### Iterating an array with `for ... in`

Not allowed. Use a `for of` loop instead to iterate over an array.

### Sorting

A sorting algorithm is [said to be stable](https://stackoverflow.com/questions/1517793/what-is-stability-in-sorting-algorithms-and-why-is-it-important) if two objects with equal keys appear in the same order in sorted output as they appear in the input array to be sorted.

- Sorting is part of the JavaScript standard library via the `Array.sort` method. It is guaraunteed to be [stable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).
- Sorting is also part of the Lua standard library via the `table.sort` method. It is **not** guaraunteed to be [stable](https://www.lua.org/manual/5.3/manual.html#pdf-table.sort).

TypeScriptToLua relies on the Lua standard library for sorting. In other words, it transpiles `[1, 2, 3].sort();` to `table.sort({1, 2, 3})`. So beware that your sorts will no longer be stable!

If you need stable sorting, you will have to implement your own sorting algorithm or find a library that provides one.

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
