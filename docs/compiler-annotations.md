---
title: Compiler Annotations
---

To improve translation and compatibility to different Lua interfaces, the TypscriptToLua transpiler supports several custom annotations that slightly change translation results. This page documents the supported annotations. The syntax of the compiler annotations use the JSDoc syntax.

#### Table of Contents

- [@compileMembersOnly](#compilemembersonly)
- [@customConstructor](#customconstructor)
- [@extension](#extension)
- [@forRange](#forRange)
- [@luaIterator](#luaIterator)
- [@luaTable](#luaTable)
- [@metaExtension](#metaextension)
- [@noResolution](#noResolution)
- [@noSelf](#noself)
- [@noSelfInFile](#noselfinfile)
- [@phantom](#phantom)
- [@pureAbstract](#pureabstract)
- [@tupleReturn](#tuplereturn)
- [@vararg](#vararg)

## @compileMembersOnly

**Target elements:** `(declare) enum`

This decorator removes an enumeration's name after compilation and only leaves its members. Primarily used for APIs with implicit enumerations.

**Example**

```typescript
declare enum myEnum {
    myEnum_memberA,         Translates to
    myEnum_memberB,         ============>
}
const myvar = myEnum.myEnum_memberA;          local myvar = myEnum.myEnum_memberA
```

```typescript
/** @compileMembersOnly */
declare enum myEnum {
    myEnum_memberA,         Translates to
    myEnum_memberB,         ============>
}
const myvar = myEnum.myEnum_memberA;          local myvar = myEnum_memberA
```

**Example 2**

```typescript
enum myEnum {                                 myEnum = {}
    myEnum_memberA,         Translates to     myEnum.myEnum_memberA = 0
    myEnum_memberB,         ============>     myEnum.myEnum_memberB = 1
    myEnum_memberC = "c"                      myEnum.myEnum_memberC = "c"
}
const myvar = myEnum.myEnum_memberA;          local myvar = myEnum.myEnum_memberA
```

```typescript
/** @compileMembersOnly */
enum myEnum {
    myEnum_memberA,         Translates to     myEnum_memberA = 0
    myEnum_memberB,         ============>     myEnum_memberB = 1
    myEnum_memberC = "c"                      myEnum_memberC = "c"
}
const myvar = myEnum.myEnum_memberA;          local myvar = myEnum_memberA
```

## @customConstructor

**Target elements:** `declare class`

Changes the way new instances of this class are made. Takes exactly one argument that is the name of the alternative constructor function.

**Example**

```typescript
declare class MyClass { constructor(x: number); }   Translates to
const inst = new MyClass(3);                        ============>   local inst = MyClass.new(true, 3);
```

```typescript
/** @customConstructor MyConstructor */
declare class MyClass { constructor(x: number); }   Translates to
const inst = new MyClass(3);                        ============>   local inst = MyConstructor(3);
```

## @extension

**Target elements:** `class`

The Extension decorator marks a class as an extension of an already existing class. This causes the class header to not be translated, preventing instantiation and the override of the existing class.

**Example**

```typescript
class myBaseClass{                            myBaseClass = myBaseClass or {}
    myFunction(): void {}     Translates to   myBaseClass.__index = myBaseClass
}                             ============>   ...
                                              function myBaseClass.myFunction(self) end
```

```typescript
/** @extension */
class myBaseClass{            Translates to
    myFunction(): void {}     ============>   function myBaseClass.myFunction(self) end
}
```

## @forRange

**Target elements:** `declare function`

Denotes a function declaration is a Lua numerical iterator. When used in a Typescript `for...of` loop, the resulting Lua will use a numerical for loop.

The function should not be a real function and an error will be thrown if it is used in any other way.

**Example**

```typescript
/** @forRange */
declare function forRange(start: number, limit: number, step?: number): number[];

                                                    Translates to
for (const i of forRange(1, 10)) {}                 ============>    for i = 1, 10 do end
for (const i of forRange(10, 1, -1)) {}                              for i = 10, 1, -1 do end
```

## @luaIterator

**Target elements:** `(declare) interface`

Denotes a type is a Lua iterator. When an object of a type with this annotation is used in a for...of statement, it will transpile directly as a lua iterator in a for...in statement, instead of being treated as a Typescript iterable. Typically, this is used on an interface that extends `Iterable` or `Array` so that Typescript will allow it to be used in a for...of statement.

**Example**

```typescript
/** @luaIterator */
interface MyIterable extends Iterable<string> {}
declare function myIterator(): MyIterable;
                                                    Translates to
for (let s of myIterator()) {}                      ============>    for s in myIterator() do end
```

This can also be combined with [@tupleReturn](#tuplereturn), if the iterator returns multiple values.

**Example**

```typescript
// Lua's built-in string.gmatch() iterator
declare namespace string {
    /** @luaIterator @tupleReturn */
    export interface GmatchIterable<string[]> extends Array<string[]> {}

    export function gmatch(s: string, pattern: string): GmatchIterable;
}

                                                           Translates to
for (const [a, b] of string.gmatch("foo", "(.)(.)")) {}    ============>    for a, b in string.gmatch("foo", "(.)(.)") do end
```

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

```typescript
class myBaseClass{                            myBaseClass = myBaseClass or {}
    myFunction(): void {}     Translates to   myBaseClass.__index = myBaseClass
}                             ============>   ...
                                              function myBaseClass.myFunction(self) end
```

```typescript
/** @metaExtension */
class myMetaExtension extends myMetaClass {
    myFunction(): void {}
}

Translates to
============>

local __meta__myMetaClass = debug.getregistry()["myMetaClass"]
__meta__myMetaClass.myFunction = function(self)
end;
```

## @noResolution

**Target elements:** `module`

Prevents tstl from trying to resolve the module path. When importing this module the path will be exactly the path in the import statement.

**Example**

```typescript
module MyModule {              Translates to
}                              ============>   ...
import module from "mymodule";                 local module = require("src.mymodule");
```

```typescript
/** @noResolution */
module MyModule {              Translates to
}                              ============>   ...
import module from "mymodule";                 local module = require("mymodule");
```

## @noSelf

**Target elements:** `declare class`, `(declare) interface` or `declare namespace`

Indicates that functions inside a scope do not take in initial `self` argument when called, and thus will be called with a dot `.` instead of a colon `:`. It is the same as if each function was declared with an explicit `this: void` parameter. Functions that already have an explicit `this` parameter will not be affected.

When applied to a class or interface, this only affects the type's declared methods (including static methods and fields with a function type). It will not affect other function declarations, such as nested functions inside a class' methods.

**Example**

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

x.normalMethod("foo");               Translates to  x:normalMethod("foo")
y.noSelfMethod("bar");               ============>  y.noSelfMethod("bar")
```

When applied to a namespace, all functions declared within the namespace will treated as if they do not have a `self` parameter. In this case, the effect is recursive, so functions in nested namespaces and types declared as parameters will also be affected.

**Example**

```typescript
declare namespace NormalNS {
    export function normalFunc(s: string): string;
}

/** @noSelf **/
declare namespace NoSelfNS {
    export function noSelfFunc(s: string): string;
}

NormalNS.normalFunc("foo");                         Translates to  NormalNS:normalFunc("foo")
NoSelfNS.noSelfFunc("bar");                         ============>  NoSelfNS.noSelfFunc("bar")
```

For more information about how the `self` parameter is handled, see [Functions and the `self` Parameter](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Functions-and-the-%60self%60-Parameter)

## @noSelfInFile

**Target elements:** `(declare) file`

Indicates that functions in a file do not take in initial `self` argument when called.

This is annotation works the same as [@noSelf](#noself) being applied to a namespace, but affects the entire file.

`@noSelfInFile` must be placed at the top of the file, before the first statement.

## @phantom

**Target elements:** `namespace`

This decorator marks a namespace as a phantom namespace. This means all members of the namespace will be translated as if they were not in that namespace. Primarily used to prevent scoping issues.

**Example**

```typescript
namespace myNameSpace {             Translates to  myNameSpace = {}
    function myFunction(): void {}  ============>  function myNameSpace.myFunction() end
}
```

```typescript
/** !phantom */
namespace myNameSpace {             Translates to
    function myFunction(): void {}  ============>  function myFunction() end
}
```

## @pureAbstract

**Target elements:** `declare class`

This decorator marks a class declaration as purely abstract. The result is that any class extending the purely abstract class will not extend this class in the resulting Lua.

**Example**

```typescript
declare class myAbstractClass {                         myClass = myClass or myAbstractClass.new()
}                                       Translates to   myClass.__index = myClass
class myClass extends myAbstractClass { ============>   myClass.__base = myAbstractClass
}                                                       function myClass.new(...
```

```typescript
/** @pureAbstract */
declare class myAbstractClass {         Translates to   myClass = myClass or {}
}                                       ============>   myClass.__index = myClass
class myClass extends myAbstractClass {                 function myClass.new(...
}
```

## @tupleReturn

**Target elements:** `(declare) function`

This decorator indicates a function returns a lua tuple instead of a table. It influences both destructing assignments of calls of that function, as well as changing the format of returns inside the function body.

**Example**

```typescript
function myFunction(): [number, string] {                function myFunction()
    return [3, "4"];                      Translates to      return {3, "4"}
}                                         ============>  end
let [a,b] = myFunction();                                local a,b = unpack(myFunction())
```

```typescript
/** @tupleReturn */
function myFunction(): [number, string] {                function myFunction()
    return [3, "4"];                      Translates to      return 3, "4"
}                                         ============>  end
let [a,b] = myFunction();                                local a, b = myFunction()
```

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

```typescript
function varargWrapUnpack(...args: string[]) {       Translates to
    console.log(...args);                            ============>    local args = ({...})
}                                                                     print(unpack(args))

/** @vararg */
interface Vararg<T> extends Array<T> {}

function varargForward(...args: Vararg<string>) {    Translates to
    console.log(...args);                            ============>    print(...)
}
```

This can be used to access the file-scope varargs as well.

**Example**

```typescript
declare const arg: Vararg<string>;                Translates to
console.log(...arg);                              ============>    print(...)
const [x, y] = [...arg];                                           local x, y = ...
```

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
