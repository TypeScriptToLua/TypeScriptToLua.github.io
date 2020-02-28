---
title: Compiler Annotations
---

import { SideBySide } from "@site/src/components/SideBySide";

To improve translation and compatibility to different Lua interfaces, the TypscriptToLua transpiler supports several custom annotations that slightly change translation results. This page documents the supported annotations. The syntax of the compiler annotations use the JSDoc syntax.

## @compileMembersOnly

**Target elements:** `(declare) enum`

This decorator removes an enumeration's name after compilation and only leaves its members. Primarily used for APIs with implicit enumerations.

**Example**

<SideBySide>

```typescript
declare enum myEnum {
  myEnum_memberA,
  myEnum_memberB,
}

const myvar = myEnum.myEnum_memberA;
```

```lua
local myvar = myEnum.myEnum_memberA
```

</SideBySide>

<SideBySide>

```typescript
/** @compileMembersOnly */
declare enum myEnum {
  myEnum_memberA,
  myEnum_memberB,
}
const myvar = myEnum.myEnum_memberA;
```

```lua
local myvar = myEnum_memberA
```

</SideBySide>

**Example 2**

<SideBySide>

```typescript
enum myEnum {
  myEnum_memberA,
  myEnum_memberB,
  myEnum_memberC = "c",
}
const myvar = myEnum.myEnum_memberA;
```

```lua
myEnum = {}
myEnum.myEnum_memberA = 0
myEnum.myEnum_memberB = 1
myEnum.myEnum_memberC = "c"

local myvar = myEnum.myEnum_memberA
```

</SideBySide>

<SideBySide>

```typescript
/** @compileMembersOnly */
enum myEnum {
  myEnum_memberA,
  myEnum_memberB,
  myEnum_memberC = "c",
}
const myvar = myEnum.myEnum_memberA;
```

```lua
myEnum_memberA = 0
myEnum_memberB = 1
myEnum_memberC = "c"

local myvar = myEnum_memberA
```

</SideBySide>

## @customConstructor

**Target elements:** `declare class`

Changes the way new instances of this class are made. Takes exactly one argument that is the name of the alternative constructor function.

**Example**

<SideBySide>

```typescript
declare class MyClass {
  constructor(x: number);
}
const inst = new MyClass(3);
```

```lua
local inst = MyClass.new(true, 3);
```

</SideBySide>

<SideBySide>

```typescript
/** @customConstructor MyConstructor */
declare class MyClass {
  constructor(x: number);
}
const inst = new MyClass(3);
```

```lua
local inst = MyConstructor(3);
```

</SideBySide>

## @extension

**Target elements:** `class`

The Extension decorator marks a class as an extension of an already existing class. This causes the class header to not be translated, preventing instantiation and the override of the existing class.

**Example**

<SideBySide>

```typescript
class myBaseClass {
  myFunction(): void {}
}
```

```lua
myBaseClass = myBaseClass or {}
myBaseClass.__index = myBaseClass
...
function myBaseClass.myFunction(self) end
```

</SideBySide>

<SideBySide>

```typescript
/** @extension */
class myBaseClass {
  myFunction(): void {}
}
```

```lua
function myBaseClass.myFunction(self) end
```

</SideBySide>

## @forRange

**Target elements:** `declare function`

Denotes a function declaration is a Lua numerical iterator. When used in a Typescript `for...of` loop, the resulting Lua will use a numerical for loop.

The function should not be a real function and an error will be thrown if it is used in any other way.

**Example**

<SideBySide>

<!-- prettier-ignore -->
```typescript
/** @forRange */
declare function forRange(start: number, limit: number, step?: number): number[];

for (const i of forRange(1, 10)) {}
for (const i of forRange(10, 1, -1)) {}
```

```lua
for i = 1, 10 do end
for i = 10, 1, -1 do end
```

</SideBySide>

## @luaIterator

**Target elements:** `(declare) interface`

Denotes a type is a Lua iterator. When an object of a type with this annotation is used in a for...of statement, it will transpile directly as a lua iterator in a for...in statement, instead of being treated as a Typescript iterable. Typically, this is used on an interface that extends `Iterable` or `Array` so that Typescript will allow it to be used in a for...of statement.

**Example**

<SideBySide>

<!-- prettier-ignore -->
```typescript
/** @luaIterator */
interface MyIterable extends Iterable<string> {}
declare function myIterator(): MyIterable;

for (let s of myIterator()) {}
```

```lua
for s in myIterator() do end
```

</SideBySide>

This can also be combined with [@tupleReturn](#tuplereturn), if the iterator returns multiple values.

**Example**

<SideBySide>

<!-- prettier-ignore -->
```typescript
// Lua's built-in string.gmatch() iterator
declare namespace string {
  /** @luaIterator @tupleReturn */
  interface GmatchIterable extends Array<string[]> {}

  function gmatch(s: string, pattern: string): GmatchIterable;
}

for (const [a, b] of string.gmatch("foo", "(.)(.)")) {}
```

```lua
for a, b in string.gmatch("foo", "(.)(.)") do end
```

</SideBySide>

## @luaTable

**Target elements:** `type`

This annotation signals the transpiler to translate a class as a simple lua table for optimization purposes.

```ts
/** @luaTable */
declare class Table<K extends {} = {}, V = any> {
  readonly length: number;
  set(key: K, value: V | undefined): void;
  get(key: K): V | undefined;
}

const tbl = new Table(); // local tbl = {}

const foo = {};
tbl.set(foo, "bar"); // tbl[foo] = "bar"
print(tbl.get(foo)); // print(tbl[foo])

tbl.set(1, "baz"); // tbl[1] = "baz"
print(tbl.length); // print(#tbl)
```

## @metaExtension

**Target elements:** `class`

The Extension decorator marks a class as an extension of an already existing meta class/table. This causes the class header to not be translated, preventing instantiation and the override of the existing class.

**Example**

<SideBySide>

```typescript
class myBaseClass {
  myFunction(): void {}
}
```

```lua
myBaseClass = myBaseClass or {}
myBaseClass.__index = myBaseClass
...
function myBaseClass.myFunction(self) end
```

</SideBySide>

<SideBySide>

```typescript
/** @metaExtension */
class myMetaExtension extends myMetaClass {
  myFunction(): void {}
}
```

```lua
local __meta__myMetaClass = debug.getregistry()["myMetaClass"]
__meta__myMetaClass.myFunction = function(self)
end;
```

</SideBySide>

## @noResolution

**Target elements:** `module`

Prevents tstl from trying to resolve the module path. When importing this module the path will be exactly the path in the import statement.

**Example**

<SideBySide>

```typescript
module MyModule {}
import module from "mymodule";
```

```lua
...
local module = require("src.mymodule");
```

</SideBySide>

<SideBySide>

```typescript
/** @noResolution */
module MyModule {}
import module from "mymodule";
```

```lua
...
local module = require("mymodule");
```

</SideBySide>

## @noSelf

**Target elements:** `declare class`, `(declare) interface` or `declare namespace`

Indicates that functions inside a scope do not take in initial `self` argument when called, and thus will be called with a dot `.` instead of a colon `:`. It is the same as if each function was declared with an explicit `this: void` parameter. Functions that already have an explicit `this` parameter will not be affected.

When applied to a class or interface, this only affects the type's declared methods (including static methods and fields with a function type). It will not affect other function declarations, such as nested functions inside a class' methods.

**Example**

<SideBySide>

```typescript
declare interface NormalInterface {
  normalMethod(s: string): void;
}
declare const x: NormalInterface;

/** @noSelf **/
declare interface NoSelfInterface {
  noSelfMethod(s: string): void;
}
declare const y: NoSelfInterface;

x.normalMethod("foo");
y.noSelfMethod("bar");
```

```lua
x:normalMethod("foo")
y.noSelfMethod("bar")
```

</SideBySide>

When applied to a namespace, all functions declared within the namespace will treated as if they do not have a `self` parameter. In this case, the effect is recursive, so functions in nested namespaces and types declared as parameters will also be affected.

**Example**

<SideBySide>

```typescript
declare namespace NormalNS {
  export function normalFunc(s: string): string;
}

/** @noSelf **/
declare namespace NoSelfNS {
  export function noSelfFunc(s: string): string;
}

NormalNS.normalFunc("foo");
NoSelfNS.noSelfFunc("bar");
```

```lua
NormalNS:normalFunc("foo")
NoSelfNS.noSelfFunc("bar")
```

</SideBySide>

For more information about how the `self` parameter is handled, see [Functions and the `self` Parameter](functions-and-the-self-parameter.md)

## @noSelfInFile

**Target elements:** `(declare) file`

Indicates that functions in a file do not take in initial `self` argument when called.

This is annotation works the same as [@noSelf](#noself) being applied to a namespace, but affects the entire file.

`@noSelfInFile` must be placed at the top of the file, before the first statement.

## @phantom

**Target elements:** `namespace`

This decorator marks a namespace as a phantom namespace. This means all members of the namespace will be translated as if they were not in that namespace. Primarily used to prevent scoping issues.

**Example**

<SideBySide>

```typescript
namespace myNameSpace {
  function myFunction(): void {}
}
```

```lua
myNameSpace = {}
function myNameSpace.myFunction() end
```

</SideBySide>

<SideBySide>

```typescript
/** !phantom */
namespace myNameSpace {
  function myFunction(): void {}
}
```

```lua
function myFunction() end
```

</SideBySide>

## @pureAbstract

**Target elements:** `declare class`

This decorator marks a class declaration as purely abstract. The result is that any class extending the purely abstract class will not extend this class in the resulting Lua.

**Example**

<SideBySide>

```typescript
declare class myAbstractClass {}
class myClass extends myAbstractClass {}
```

```lua
myClass = myClass or myAbstractClass.new()
myClass.__index = myClass
myClass.__base = myAbstractClass
function myClass.new(...
```

</SideBySide>

<SideBySide>

```typescript
/** @pureAbstract */
declare class myAbstractClass {}
class myClass extends myAbstractClass {}
```

```lua
myClass = myClass or {}
myClass.__index = myClass
function myClass.new(...
```

</SideBySide>

## @tupleReturn

**Target elements:** `(declare) function`

This decorator indicates a function returns a lua tuple instead of a table. It influences both destructing assignments of calls of that function, as well as changing the format of returns inside the function body.

**Example**

<SideBySide>

```typescript
function myFunction(): [number, string] {
  return [3, "4"];
}
let [a, b] = myFunction();
```

```lua
function myFunction()
    return {3, "4"}
end
local a,b = unpack(myFunction())
```

</SideBySide>

<SideBySide>

```typescript
/** @tupleReturn */
function myFunction(): [number, string] {
  return [3, "4"];
}
let [a, b] = myFunction();
```

```lua
function myFunction()
    return 3, "4"
end
local a, b = myFunction()
```

</SideBySide>

If you wish to use this annotation on function with overloads, it must be applied to each signature that requires it.

**Example**

```typescript
/** @tupleReturn */
declare function myFunction(s: string): [string, string];
/** @tupleReturn */
declare function myFunction(n: number): [number, number];
```

Note that if any overloaded signature of a function implementation has the annotation, all array/tuple return values will unpacked in the transpiled output.

## @vararg

**Target elements:** `(declare) interface or type`

Indicates that an array-like type represents a Lua vararg expression (`...`) and should be transpiled to that when used in a spread expression. This is useful for forwarding varargs instead of wrapping them in a table and unpacking them.

**Example**

<SideBySide>

```typescript
function varargWrapUnpack(...args: string[]) {
  console.log(...args);
}
```

```lua
local args = ({...})
print(unpack(args))
```

</SideBySide>

<SideBySide>

```typescript
/** @vararg */
interface Vararg<T> extends Array<T> {}

function varargForward(...args: Vararg<string>) {
  console.log(...args);
}
```

```lua
print(...)
```

</SideBySide>

This can be used to access the file-scope varargs as well.

**Example**

<SideBySide>

```typescript
declare const arg: Vararg<string>;
console.log(...arg);
const [x, y] = [...arg];
```

```lua
print(...)
local x, y = ...
```

</SideBySide>

To also support tuple-typed rest parameters, you can define the type like this:

**Example**

```typescript
/** @vararg */
type Vararg<A extends unknown[]> = A & { __luaVararg?: never };

function varargForward(...args: Vararg<[string, number]>) {}
```

**_Warning_**

TypeScriptToLua does not check that the vararg expression is valid in the context it is used. If the array is used in a spread operation in an invalid context (such as a nested function), a Lua compiler error will occur.

**Example**

```typescript
function outerFunction(...args: Vararg<string>) {
  function innerFunction() {
    console.log(...args); // cannot use '...' outside a vararg function
  }
  innerFunction();
}
```
