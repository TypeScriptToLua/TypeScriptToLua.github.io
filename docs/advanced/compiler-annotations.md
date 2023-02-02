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
