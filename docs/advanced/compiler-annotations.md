---
title: Compiler Annotations
---

import { SideBySide } from "@site/src/components/SideBySide";
import { DeprecatedInVersion } from "@site/src/components/DeprecatedInVersion";

To improve translation and compatibility to different Lua interfaces, the TypeScriptToLua transpiler supports several custom annotations that slightly change translation results. This page documents the supported annotations. The syntax of the compiler annotations use the JSDoc syntax.

## @compileMembersOnly

**Target elements:** `(declare) enum`

This decorator removes an enumeration's name after compilation and only leaves its members. Primarily used for APIs with implicit enumerations.

**Example**

<SideBySide>

```typescript
declare enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua
print(MyEnum.MY_ENUM_MEMBER_A)
```

</SideBySide>

<SideBySide>

```typescript
/** @compileMembersOnly */
declare enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua
print(MY_ENUM_MEMBER_A)
```

</SideBySide>

**Example 2**

<SideBySide>

```typescript
enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
  MY_ENUM_MEMBER_C = "c",
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua
MyEnum = {}
MyEnum.MY_ENUM_MEMBER_A = 0
MyEnum.MY_ENUM_MEMBER_B = 1
MyEnum.MY_ENUM_MEMBER_C = "c"

print(MyEnum.MY_ENUM_MEMBER_A)
```

</SideBySide>

<SideBySide>

```typescript
/** @compileMembersOnly */
enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
  MY_ENUM_MEMBER_C = "c",
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua
MY_ENUM_MEMBER_A = 0
MY_ENUM_MEMBER_B = 1
MY_ENUM_MEMBER_C = "c"

print(MY_ENUM_MEMBER_A)
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
local inst = __TS__New(MyClass, 3)
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
local inst = MyConstructor(3)
```

</SideBySide>

## @noResolution

**Target elements:** `module`

Prevents tstl from trying to resolve the module path. When importing this module the path will be exactly the path in the import statement.

**Example**

<SideBySide>

```typescript
declare module "mymodule" {}
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
declare module "mymodule" {}
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
  function normalFunc(s: string): string;
}

/** @noSelf **/
declare namespace NoSelfNS {
  function noSelfFunc(s: string): string;
}

NormalNS.normalFunc("foo");
NoSelfNS.noSelfFunc("bar");
```

```lua
NormalNS:normalFunc("foo")
NoSelfNS.noSelfFunc("bar")
```

</SideBySide>

For more information about how the `self` parameter is handled, see [Functions and the `self` Parameter](../the-self-parameter.md)

## @noSelfInFile

**Target elements:** `(declare) file`

Indicates that functions in a file do not take in initial `self` argument when called.

This is annotation works the same as [@noSelf](#noself) being applied to a namespace, but affects the entire file.

`@noSelfInFile` must be placed at the top of the file, before the first statement.

## @tupleReturn

**Target elements:** `(declare) function`

This decorator indicates a function returns a lua tuple instead of a table. It influences both destructing assignments of calls of that function, as well as changing the format of returns inside the function body.

**Example**

<SideBySide>

```typescript
function myFunction(): [number, string] {
  return [3, "4"];
}
const [a, b] = myFunction();
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
const [a, b] = myFunction();
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

## Deprecated

:::warning
Some annotations are deprecated and will be/have been removed.
Below are the deprecated annotations and instructions to recreate their behavior with vanilla TypeScript.
:::

### @extension

<DeprecatedInVersion deprecated="0.37.0" removed="0.39.0" />

**Target elements:** `class`

The Extension decorator marks a class as an extension of an already existing class.
This causes the class header to not be translated, preventing instantiation and the override of the existing class.

**Default Behavior**

<SideBySide>

```typescript
class MyClass {
  myFunction(): void {}
}
```

```lua
MyClass = __TS__Class()
...
function MyClass.prototype.myFunction(self) end
```

</SideBySide>

**Example 1**

<SideBySide>

```typescript
/** @extension */
class MyClass {
  myFunction(): void {}
}
```

```lua
function MyClass.myFunction(self) end
```

</SideBySide>

**Example 2**

<SideBySide>

```typescript
/** @extension ExistingClassTable */
class MyClass extends ExistingClass {
  myFunction(): void {}
}
```

```lua
function ExistingClassTable.myFunction(self) end
```

</SideBySide>

**Upgrade Instructions**

Use an interface to extend your existing class and declare the table of the existing class as variable.

**Example**

<SideBySide>

```typescript
interface ExistingClass {
  myFunction(): void;
}

declare const ExistingClassTable: ExistingClass;

ExistingClassTable.myFunction = function () {};
```

```lua
function ExistingClassTable.myFunction(self) end
```

</SideBySide>

### @metaExtension

<DeprecatedInVersion deprecated="0.37.0" removed="0.39.0" />

**Target elements:** `class`

The Extension decorator marks a class as an extension of an already existing meta class/table.
This causes the class header to not be translated, preventing instantiation and the override of the existing class.

**Example**

<SideBySide>

```typescript
class MyBaseClass {
  myFunction(): void {}
}
```

```lua
MyBaseClass = __TS__Class()
...
function MyBaseClass.prototype.myFunction(self) end
```

</SideBySide>

<SideBySide>

```typescript
/** @metaExtension */
class MyMetaExtension extends MyMetaClass {
  myFunction(): void {}
}
```

```lua
local __meta__MyMetaClass = debug.getregistry().MyMetaClass
__meta__MyMetaClass.myFunction = function(self)
end;
```

</SideBySide>

**Upgrade Instructions**

Use an interface to extend your existing class and assign the functions to the meta table of the existing class.

<SideBySide>

```typescript
interface MyMetaClass {
  myFunction(): void;
}

const MyMetaClassTable: MyMetaClass = debug.getregistry().MyMetaClass as MyMetaExtension;

MyMetaClassTable.myFunction = function () {};
```

```lua
MyMetaClassTable = debug.getregistry().MyMetaClass
MyMetaClassTable.myFunction = function(self)
end
```

</SideBySide>

### @phantom

<DeprecatedInVersion deprecated="0.37.0" removed="0.39.0" />

**Target elements:** `namespace`

This decorator marks a namespace as a phantom namespace.
This means all members of the namespace will be translated as if they were not in that namespace. Primarily used to prevent scoping issues.

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
/** @phantom */
namespace myNameSpace {
  function myFunction(): void {}
}
```

```lua
function myFunction() end
```

</SideBySide>

**Upgrade instructions**

Use ECMAScript modules and import/export. Alternatively, use a real (non-phantom) namespace.

### @pureAbstract

<DeprecatedInVersion deprecated="0.37.0" removed="0.39.0" />

**Target elements:** `declare class`

This decorator marks a class declaration as purely abstract.
The result is that any class extending the purely abstract class will not extend this class in the resulting Lua.

**Example**

<SideBySide>

```typescript
declare class MyAbstractClass {}
class MyClass extends MyAbstractClass {}
```

```lua
MyClass = __TS__Class()
MyClass.__base = MyAbstractClass
MyClass.____super = MyAbstractClass
setmetatable(MyClass, MyClass.____super)
setmetatable(MyClass.prototype, MyClass.____super.prototype)
```

</SideBySide>

<SideBySide>

```typescript
/** @pureAbstract */
declare class MyAbstractClass {}
class MyClass extends MyAbstractClass {}
```

```lua
MyClass = __TS__Class()
```

</SideBySide>

**Upgrade Instructions**

Try declaring the "classes" of your lua enviroment as interface.
If that is not possible use interface merging as suggested below.

<SideBySide>

```typescript
declare class MyAbstractClass {}
interface MyClass extends MyAbstractClass {}

class MyClass {}
```

```lua
MyClass = __TS__Class()
```

</SideBySide>

### @forRange

<DeprecatedInVersion deprecated="0.38.0" removed="TBD" />

**Target elements:** `declare function`

Denotes a function declaration is a Lua numerical iterator. When used in a TypeScript `for...of` loop, the resulting Lua will use a numerical for loop.

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

**Upgrade Instructions**

Use the [`$range` language extension](language-extensions.md#$range-iterator-function) instead of a custom annotated type.

<SideBySide>

<!-- prettier-ignore -->
```typescript
for (const i of $range(1, 10)) {}
for (const i of $range(10, 1, -1)) {}
```

```lua
for i = 1, 10 do end
for i = 10, 1, -1 do end
```

</SideBySide>

### @luaIterator

<DeprecatedInVersion deprecated="0.38.1" removed="TBD" />

**Target elements:** `(declare) interface`

Denotes a type is a Lua iterator. When an object of a type with this annotation is used in a for...of statement, it will transpile directly as a lua iterator in a for...in statement, instead of being treated as a TypeScript iterable. Typically, this is used on an interface that extends `Iterable` or `Array` so that TypeScript will allow it to be used in a for...of statement.

**Example**

<SideBySide>

<!-- prettier-ignore -->
```typescript
/** @luaIterator */
type LuaIterator<T> = Iterable<T>;

declare function myIterator(): LuaIterator<string>;
for (const s of myIterator()) {}
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
/** @luaIterator @tupleReturn */
type LuaTupleIterator<T extends any[]> = Iterable<T>;

declare namespace string {
  function gmatch(s: string, pattern: string): LuaTupleIterator<string[]>;
}

for (const [a, b] of string.gmatch("foo", "(.)(.)")) {}
```

```lua
for a, b in string.gmatch("foo", "(.)(.)") do end
```

</SideBySide>

**Upgrade Instructions**

Use the [`LuaIterable` and `LuaMultiReturn` language extensions](language-extensions.md#luaiterable-type) instead of a custom annotated types.

<SideBySide>

<!-- prettier-ignore -->
```typescript
declare function myIterator(): LuaIterable<string>;
for (const s of myIterator()) {}
```

```lua
for s in myIterator() do end
```

</SideBySide>

<SideBySide>

<!-- prettier-ignore -->
```typescript
declare namespace string {
  function gmatch(s: string, pattern: string): LuaIterable<LuaMultiReturn<string[]>>;
}

for (const [a, b] of string.gmatch("foo", "(.)(.)")) {}
```

```lua
for a, b in string.gmatch("foo", "(.)(.)") do end
```

</SideBySide>

### @luaTable

<DeprecatedInVersion deprecated="0.39.0" removed="TBD" />

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

**Upgrade Instructions**

Use the built-in [`LuaTable` language extension](language-extensions.md#lua-table-types) instead of a custom annotated type.

```ts
const tbl = new LuaTable(); // local tbl = {}

const foo = {};
tbl.set(foo, "bar"); // tbl[foo] = "bar"
print(tbl.get(foo)); // print(tbl[foo])

tbl.set(1, "baz"); // tbl[1] = "baz"
print(tbl.length()); // print(#tbl)
```

### @vararg

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
function varargWrapUnpack(self, ...)
    local args = ({...})
    print(unpack(args))
end
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
function varargForward(self, ...)
    print(...))
end
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
type Vararg<T extends unknown[]> = T & { __luaVararg?: never };

function varargForward(...args: Vararg<[string, number]>) {}
```

**_Warning_**

TypeScriptToLua does not check that the vararg expression is valid in the context it is used. If the array is used in a spread operation in an invalid context (such as a nested function), a deoptimization will occur.

**Example**

<SideBySide>

```typescript
function outerFunction(...args: Vararg<string>) {
  function innerFunction() {
    console.log(...args);
  }
  innerFunction();
}
```

```lua
function outerFunction(self, ...)
    local args = {...}
    local function innerFunction(self)
        print(unpack(args))
    end
    innerFunction(_G)
end
```

</SideBySide>

**Upgrade Instructions**

`@vararg` is no longer required to prevent vararg parameters from being wrapped in a table. The ellipsis operator will now automatically be used if the parameter is used in a spread expression.

Example:

<SideBySide>

```ts
function varargForward(...args: string[]) {
  console.log(...args);
}
```

```lua
function varargForward(...)
  print(...)
end
```

</SideBySide>

However, if the parameter is accessed as an array or tuple, it will be wrapped in a table.

Example:

<SideBySide>

```ts
function varargAccess(...args: string[]) {
  console.log(args[0]);
}
```

```lua
function varargAccess(...)
  local args = {...}
  print(args[1])
end
```

</SideBySide>

Note that are a few cases where the parameter will still be wrapped in a table, even if a spread expression is used, in order to generate correctly functioning Lua.
