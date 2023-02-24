---
title: Type Declarations
---

Using TypeScript instead of Lua is useful because everything plugs together in a verifiable way. With that in mind, `tstl` is not very useful unless you pair it with type declarations for your particular Lua environment. That way, TypeScript can catch the typos when you call some API function or use some API variable.

If you need help writing declarations, feel free to [join our Discord server](https://discord.gg/BWAq58Y).

## About Declaration Files

Declaration files end with the extension `.d.ts` (which stands for "declaration TypeScript file"). Declaration files are different from normal `.ts` files in that they must only contain _ambient_ code. In the context of TypeScript, _ambient_ refers to code that is wiped away by the compiler and not emitted into the actual program output.

In other words, anything you put into a `.d.ts` file will inform the TypeScript compiler about what the format of something is. And it will never appear in the generated `.lua` file(s).

For TypeScriptToLua, these files should contain information that describes the target Lua environment. This means functions, modules, variables and other members of the target Lua environment are primarily described in these files.

:::note
You can write ambient declarations inside _.ts_ files as well.
:::

## Declare Keyword

The `declare` keyword is used to say that the following declaration defines something that exists within global scope. Like something within the `_G` table in Lua.

This is useful for defining Lua's environment.

```ts title=_G.d.ts
// Uses some declarations from
// https://www.lua.org/manual/5.1/manual.html

/**
 * A global variable (not a function) that holds a string containing the
 * current interpreter version.
 */
declare const _VERSION: number;

/**
 * Receives any number of arguments, and prints their values to stdout, using the
 * `tostring` function to convert them to strings. print is not intended for
 * formatted output, but only as a quick way to show a value, typically for
 * debugging. For formatted output, use string.format.
 * @param args Arguments to print
 */
declare function print(...args: any[]): void;
```

```ts title=main.ts
print(_VERSION); // Editor and transpiler know what print and _VERSION are
```

:::note
You can use `declare` to write ambient declarations inside _.ts_ files.
:::

## Export Keyword

The export keyword indicates something is exported and can be used by external code.

This also includes ambient interfaces, types, modules and other items that don't result in any transpiled code.

If a file named _lib.lua_ exists and returns a table with an `x` field, you can write _lib.d.t.s_ as follows to tell TypeScript that _lib_ exists and what it provides.

```ts title=lib.d.ts
export let x: number;
```

```ts title=main.ts
import { x } from "./lib";
```

If a namespace contains certain functions, `export` tells TypeScript that those functions can be accessed within the namespace.

```ts title=table.d.ts
declare namespace table {
  /**
   * @noSelf
   */
  export function insert(table: object, item: any): number;
}
```

```ts title=main.ts
table.insert({}, 1);
```

If a globally available module exists within the Lua environment. You can define what the module provides.

```ts title=utf8.d.ts
declare module "utf8" {
  /**
   * @noSelf
   */
  export function codepoint(): void;
}
```

```ts title=main.ts
import * as utf8 from "utf8"; // equiv to `local utf8 = require("utf8");
utf8.codepoint();
```

The `export` keyword can be used in a `.ts` or `.d.ts` file. It tells the transpiler and your editor (potentially) that something **contains/provides** something that you can either import (by using `import` in TS or `require()` in Lua) or access.

## Self Parameter

TypeScript has a hidden `this` parameter attached to every function.

This causes TypeScriptToLua to treat every function as if `self` exists as its first parameter.

```ts
declare function assert(value: any): void;
// TypeScript:          assert(this: any, value: any): void;
// TypeScriptToLua:     assert(self, value)
assert(true); // assert(_G, true)
```

This allows users to modify `this` inside a function and expect behaviour similar to what JavaScript does.

But obviously Lua does not have a `self` parameter for every function, so one of the three options must happen to tell TypeScriptToLua there is no "contextual parameter" (`self`):

1. Use `this: void` as the first parameter of the function / method. This formally describes to TypeScript to not allow `this` to be modified inside this function. (you could also use the [noImplicitThis](configuration.md#custom-options) option to disallow `this` to be modified if `this` is of an `any` type).
2. Use `@noSelf` in the comments of the declaration's owner (the namespace, module, object, etc).
3. Use `@noSelfInFile` at the beginning of the file in a comment to make sure every function defined in this file does not use a "contextual parameter".

Below is three ways to make `table.remove` not use a "contextual parameter".

```ts
declare namespace table {
  export function remove(this: void, table: object, index: number): any;
}
```

```ts
/** @noSelf */
declare namespace table {
  export function remove(table: object, index: number): any;
}
```

```ts
/** @noSelfInFile */

declare namespace table {
  export function remove(table: object, index: number): any;
}
```

By doing this, the transpiler also figures out if it needs to use `:` or `.` when invoking a function / method.

## Comments and Annotations

If you're using an editor that seeks out information about functions, variables, etc. It will likely find the file where what it is analyzing is defined and check out the comment above it.

```ts
/**
 * When hovering over print, this description will be shown
 * @param args Stuff to print
 */
declare function print(...args: any[]);
```

<p><a href="/play/#code/PTAEEEBtNBLA7UB7eBTUATVAzBsAusKoAhvBnALYAOkqlq8+Jhx2SATqKgB4k10AzqEEkA1qgBQk4ACpZk0LNAB1ABaNQapADdUHBAHNkertQNMANKHxrYwrIIDGB6q0QB3WNFAAjdILaHvCKygAC1CQc-KAA3mQAngDaALoAvqQchsIAyvgArtjYNkig5gj4ocCSWE6QUejY+fBO7mUW+AAUAHS9UdkAXKTwySkAlADc0iCgACocCVq6+kagCUj5XE6bgpwm+qAABuVMh5InXQBEABKo0EiXk5JAA" target="_blank">Try out what this looks like in an editor</a></p>

TypeScript uses [TSDoc](https://github.com/microsoft/tsdoc) for its comments. TSDoc allows you to also use markdown in your comments! This means pictures, links, tables, code syntax highlighting and more markdown features are available. These may display differently depending on the editor in use.

Here are some commonly used TSDoc tags used in comments:

| Tag                           | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| `@param <name> <description>` | Defines a parameter. e.g. A parameter for a function |
| `@return <description>`       | Describes the return value of a function / method    |

TypeScriptToLua takes this further. Some "tags" change how the transpiler translates certain pieces of code. These are referred to as [annotations](advanced/compiler-annotations.md).

As an example, `@tupleReturn` marks a function as something which returns multiple values instead of its array.

```ts
/**
 * Returns multiple values
 * @tupleReturn
 */
declare function tuple(): [number, number];

let [a, b] = tuple();
// local a, b = tuple()
```

```ts
/**
 * Returns a table array containing two numbers
 */
declare function array(): [number, number];

let [c, d] = array();
// local c, d = unpack(array())
```

See [Compiler Annotations](advanced/compiler-annotations.md) page for more information.

## Environmental Declarations

By default, TypeScript includes global type declarations for both ECMAScript and web standards. TypeScriptToLua aims to support only standard ECMAScript feature set. To make TypeScript not suggest you to use unsupported browser builtins (including `window`, `document`, `console`, `setTimeout`) you can specify a `lib` option:

```json title=tsconfig.json
{
  "compilerOptions": {
    "lib": ["esnext"]
  }
}
```

It is also possible to use `noLib` to remove every standard declaration (to use TypeScriptToLua only for syntactic features with Lua standard library) but TypeScript **needs** certain declarations to exist so they will have to be manually defined, so using `noLib` is not recommended.

## Advanced Types

We recommend reading about Mapped and Conditional types. These things can be used as effective tools to describe some dynamic things that you may have in Lua.

- [Advanced Types (TypeScriptLang)](https://www.typescriptlang.org/docs/handbook/advanced-types.html#)
  - [Mapped Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#mapped-types)
  - [Conditional Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#conditional-types)

## Declaration Merging

https://www.typescriptlang.org/docs/handbook/declaration-merging.html

Some examples of declaration merging have been shown in the above examples.

### Function + Table

Some tables can use `__call` to make themselves callable. Busted (the Lua testing suite) does this to `assert`.

```ts title=assert.d.ts
declare function assert(value: any, errorDescription?: string): void;
declare namespace assert {
  export function isEqual(): void;
}
```

```ts title=main.ts
assert.isEqual();
assert();
```

## Declaration Examples

### Interfaces

```ts title=image.d.ts
interface Image {
  /** @tupleReturn */
  getDimensions(): [number, number];
}

// This interface merges with its previous declaration
/** @noSelf */
interface Image {
  getFlags(): object;
}
```

```ts title=main.ts
declare let image: Image;
let [w, h] = image.getDimensions(); // local w, h = image:getDimensions()
let o = image.getFlags();
```

### Namespaces

```ts title=love.d.ts
declare namespace love {
  export let update: (delta: number) => void;
  /** @tupleReturn */
  export function getVersion(delta: number): [number, number, number, string];
  export namespace graphics {
    function newImage(filename: string): Image;
  }
}

// This namespace merges with its previous declaration
/** @noSelf */
declare namespace love {
  export let update: (delta: number) => void;
}

/** @noSelf */
declare namespace string {
  function byte(s: string, i?: number, j?: number): number;
}
```

```ts title=main.ts
let [a, b, c, d] = love.getVersion();
let p = love.graphics.newImage("file.png");
```

### Classes

Because Lua doesn't have a strictly defined concept of a class, for TypeScriptToLua `class` declaration implies a very specific structure, built specifically for TypeScript compatibility. Because of that, usually you shouldn't use `declare class` for values coming from Lua.

Most of Lua patterns used to simulate classes can be declared using interfaces instead.

**Example 1**: a table with a static `new` method to construct new instances

```lua
Box = {}
Box.__index = Box

function Box.new(value)
    local self = {}
    setmetatable(self, Box)
    self._value = value
    return self
end

function Box:get()
    return self._value
end
```

```ts
interface Box {
  get(): string;
}

interface BoxConstructor {
  new: (this: void, value: string) => Box;
}

declare var Box: BoxConstructor;

// Usage
const box = Box.new("foo");
box.get();
```

**Example 2**: a callable table with extra static methods

```lua
Box = {}

local instance
function Box:getInstance()
    if instance then return instance end
    instance = Box("instance")
    return instance
end

setmetatable(Box, {
    __call = function(_, value)
        return { get = function() return value end }
    end
})
```

```ts
interface Box {
  get(): string;
}

interface BoxConstructor {
  (this: void, value: string): Box;
  getInstance(): Box;
}

declare var Box: BoxConstructor;

// Usage
const box = Box("foo");
box.get();
Box.getInstance().get();
```

### Ambient Modules

You may have to use the `@noResolution` annotation to tell TypeScriptToLua to not try any path resolution methods when the specified module is imported.

Module declarations need to be kept in _.d.ts_ files.

```ts title=types.d.ts
/** @noSelf */
declare module "image-size" {
  export function getimagewidth(filename: string): number;
  export function getimageheight(filename: string): number;
}

/**
 * A module that only contains a number
 * @noResolution
 */
declare module "number-of-the-day" {
  let x: number;
  export = x;
}

/**
 * Not very useful for TypeScript. It has no idea what is in here.
 * @noResolution
 */
declare module "custom-module";
```

```ts title=main.ts
import { getimagewidth, getimageheight } from "image-size";
import * as x from "number-of-the-day";
import * as customModule from "custom-module";
```

### Unions

Unions can be used to tell TypeScript that a given type could be one of many other types. TypeScript can then pick up hints in the code to figure out what that type is at a given statement.

<!-- prettier-ignore -->
```ts
declare interface PingResponse {
  type: "ping";
  timeTaken: number;
}

declare interface MessageResponse {
  type: "message";
  text: string;
}

declare type Response = PingResponse | MessageResponse;

declare let response: Response;

response.timeTaken;
// Not allowed, if response is a MessageResponse, it won't have a timeTaken field

switch (response.type) {
  case "ping":
    // If the program arrives here, response: PingResponse
    return response.timeTaken;
  case "message":
    // If the program arrives here, response: MessageResponse
    return response.text;
  case "disconnect":
    // Impossible
  default:
    // Because of what Response is described as, TypeScript knows getting
    // here is impossible.
}
```

### keyof

```ts
declare interface AvailableFiles {
  "player.png": any;
  "file.txt": any;
}

declare function getFile(filename: keyof AvailableFiles): string;

getFile("player.png"); // Valid
getFile("unknown.png"); // Invalid
```

### Literal Types

String and number values can be used as types too. In combination with union types it can be used to represent a known set of values.

```ts
declare function drawLine(type: "solid" | "dashed"): void;
drawLine("solid"); // Valid
drawLine("rounded"); // Invalid
```

```ts
declare function getSupportedColors(): 1 | 8 | 256 | 16777216;
getSupportedColors() === 8; // Valid
getSupportedColors() === 16; // Invalid
```

### Keyword Workarounds

Some functions in Lua can have names that are keywords in TypeScript (e.g., `try`, `catch`, `new`, etc).

The parent to these kinds of functions will need to be represented as a JSON object.

```ts
// ❌
declare namespace table {
  export function new: () => any;
}

// ✔
declare let table: {
  new: () => any;
};
```

```ts
// ❌
declare module "creator" {
  export function new: () => any;
}

// ✔
declare module "creator" {
  let exports: {
    new: () => any;
  };
  export = exports;
}
```

### Operator Overloads

Lua supports overloading of mathematical operators such as `+`, `-` or `*`. This is performed using the [metatable methods](https://www.lua.org/manual/5.4/manual.html#2.4) `__add`, `__sub`, `__mul`, `__div`, and `__unm`. Since TypeScript does not support operator overloading in its type system, this feature is hard to replicate. Unfortunately, this is not something that can be fixed properly right now without forking off our custom TypeScript version.

However, there are two possible workarounds. The first one is to declare a type as an intersection type with `number`. It will then inherit all mathematical operators. Keep in mind that this is only partially type safe and may require some additional casting.

Example:

```ts
declare type Vector = number & {
  x: number;
  y: number;
  dot(v: Vector): number;
  cross(v: Vector): Vector;
};

declare function Vector(x: number, y: number): Vector;

const v1 = Vector(3, 4);
const v2 = Vector(4, 5);
const v3 = (v1 * 4) as Vector;
const d = v3.dot(v2);
```

The second option was added in version [0.38.0](https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/CHANGELOG.md#0380). You can now use [language extensions](https://typescripttolua.github.io/docs/advanced/language-extensions) that allow declaring special functions which will transpile to operators. This will be completely type safe if the operators are declared correctly. See [Operator Map Types](advanced/language-extensions.md#operator-map-types) for more information.

### Import and export

Using `import` can be important for making sure an _index.d.ts_ file contains all the declarations needed.

```ts title=index.d.ts
import "./lib";
// All global declarations in lib will be included with this file

export { Player } from "./Entities";
// The Player declaration is re-exported from this file
```

It is also possible to place `import` statements inside ambient modules and namespaces.

```ts
declare module "mymodule" {
  import * as types from "types";
  export function getType(): types.Type;
}
```

## npm Publishing

It is possible to publish a list of declarations for other users to easily download via [npm](https://www.npmjs.com/).

```bash
npm init
npm login               # Need npm account
npm publish --dry-run   # Show what files will be published
npm version 0.0.1       # Update the version in package.json when --dry-run seems good
npm publish             # Publish to npm (only if you're 100% sure)
```

Then the user can install this package using:

```bash
npm install <declarations> --save-dev
```

And link it to a _tsconfig.json_ file.

```json title=tsconfig.json
{
  "compilerOptions": {
    "types": ["declarations"]
  }
}
```

## Debugging Declarations

If you have TypeScript installed, you can use the command below to list all files a _tsconfig.json_ file targets.

```bash
tsc -p tsconfig.json --noEmit --listFiles
```

This only works with TypeScript (_tsc_). TypeScriptToLua (_tstl_) may have support for this in the future.

Every TypeScript project points to a list of declarations. TypeScript is very generous with what files that includes.

```json title=tsconfig.json
{
  "compilerOptions": {
    "rootDir": "src"
  }
}
```

```diff
  node_modules/
+ src/main.ts
+ src/actors/Player.ts
+ global.ts
  tsconfig.json
```

```json title=tsconfig.json
{
  "compilerOptions": {
    "rootDir": "src",
    "types": ["lua-types/jit"]
  }
}
```

```diff
+ node_modules/lua-types/jit.d.ts
+ src/main.ts
+ src/actors/Player.ts
+ global.ts
  tsconfig.json
```
