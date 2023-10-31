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

```typescript title=input.ts
declare enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua title=output.lua
print(MyEnum.MY_ENUM_MEMBER_A)
```

</SideBySide>

<SideBySide>

```typescript title=input.ts
/** @compileMembersOnly */
declare enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua title=output.lua
print(MY_ENUM_MEMBER_A)
```

</SideBySide>

**Example 2**

<SideBySide>

```typescript title=input.ts
enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
  MY_ENUM_MEMBER_C = "c",
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua title=output.lua
MyEnum = {}
MyEnum.MY_ENUM_MEMBER_A = 0
MyEnum.MY_ENUM_MEMBER_B = 1
MyEnum.MY_ENUM_MEMBER_C = "c"

print(MyEnum.MY_ENUM_MEMBER_A)
```

</SideBySide>

<SideBySide>

```typescript title=input.ts
/** @compileMembersOnly */
enum MyEnum {
  MY_ENUM_MEMBER_A,
  MY_ENUM_MEMBER_B,
  MY_ENUM_MEMBER_C = "c",
}

print(MyEnum.MY_ENUM_MEMBER_A);
```

```lua title=output.lua
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

```typescript title=input.ts
declare class MyClass {
  constructor(x: number);
}
const inst = new MyClass(3);
```

```lua title=output.lua
local inst = __TS__New(MyClass, 3)
```

</SideBySide>

<SideBySide>

```typescript title=input.ts
/** @customConstructor MyConstructor */
declare class MyClass {
  constructor(x: number);
}
const inst = new MyClass(3);
```

```lua title=output.lua
local inst = MyConstructor(3)
```

</SideBySide>

## @noResolution

**Target elements:** `module`

Prevents tstl from trying to resolve the module path. When importing this module the path will be exactly the path in the import statement.

**Example**

<SideBySide>

```typescript title=input.ts
declare module "mymodule" {}
import module from "mymodule";
```

```lua title=output.lua
...
local module = require("src.mymodule");
```

</SideBySide>

<SideBySide>

```typescript title=input.ts
/** @noResolution */
declare module "mymodule" {}
import module from "mymodule";
```

```lua title=output.lua
...
local module = require("mymodule");
```

</SideBySide>

## @customName

**Target elements:** Any declaration statement

This decorator can be used to rename variables, identifiers, etc. Meaning that you can name something `x` in your Typescript environment, but then have it compile under the name `y`.

This can be quite handy to get around some reserved keywords in Typescript, which you might need/want to use in Lua.

**Example**

<SideBySide>

```typescript title=input.ts
/** @customName test2 */
function test() {}

test();
```

```lua title=output.lua
...
function test2(self)
end
test2(_G)
```

</SideBySide>

<SideBySide>

```typescript title=input.ts
/** @customName Test2 **/
namespace Test {
  /** @customName Func2 **/
  export function Func(): string {
    return "hi";
  }
}

Test.Func();
```

```lua title=output.lua
...
Test2 = Test2 or ({})
do
  function Test2.Func2(self)
    return "hi"
  end
end
Test2:Func2()
```

</SideBySide>

## @noSelf

**Target elements:** `declare class`, `(declare) interface` or `declare namespace`

Indicates that functions inside a scope do not take in initial `self` argument when called, and thus will be called with a dot `.` instead of a colon `:`. It is the same as if each function was declared with an explicit `this: void` parameter. Functions that already have an explicit `this` parameter will not be affected.

When applied to a class or interface, this only affects the type's declared methods (including static methods and fields with a function type). It will not affect other function declarations, such as nested functions inside a class' methods.

**Example**

<SideBySide>

```typescript title=input.ts
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

```lua title=output.lua
x:normalMethod("foo")
y.noSelfMethod("bar")
```

</SideBySide>

When applied to a namespace, all functions declared within the namespace will treated as if they do not have a `self` parameter. In this case, the effect is recursive, so functions in nested namespaces and types declared as parameters will also be affected.

**Example**

<SideBySide>

```typescript title=input.ts
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

```lua title=output.lua
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
