---
title: Functions and the `self` Parameter
---

import { SideBySide } from "@site/src/components/SideBySide";

# Every Function Has a Context Parameter

In JavaScript and TypeScript, almost all functions have access to an implicit `this` parameter. In order to maintain compatibility with this, all Lua functions are generated with an extra initial context parameter.

**Example**

<SideBySide>

```typescript
function myFunction(arg: string) {}
myFunction("foo");
```

```lua
function myFunction(self, arg)
end
myFunction(nil, "foo")
```

</SideBySide>

The reason for this is that a method can be assigned to a stand-alone function and vice-versa.

**Example**

```typescript
class MyClass {
  myMethod(arg: string) {
    console.log("myMethod", arg);
  }
}

let myFunction = function(arg: string) {
  console.log("myFunction", arg);
};

const c = new MyClass();

c.myMethod = myFunction;
c.myMethod("foo"); // should output: myFunction foo
// or
myFunction = c.myMethod;
myFunction("foo"); // should output: myMethod foo;
```

If `myFunction` did not have the initial parameter, calling either after being re-assigned would cause potential runtime errors, since `myMethod` would expect an initial parameter and `myFunction` would not.

Note that even declared functions are assumed to have this extra parameter as well.

**Example**

<SideBySide>

```typescript
declare function myLibFunction(arg: string): void;
myLibFunction("foo");
```

```lua
myLibFunction(nil, "foo")
```

</SideBySide>

# Removing the Context Parameter

When dealing with external library functions that don't expect this initial parameter, you will need to inform TypeScriptToLua. This can be done a few different ways.

## `this: void`

You can declare any function with `this: void` to prevent generation of this initial argument.

**Example**

<SideBySide>

```typescript
declare function myLibFunction(this: void, arg: string): void;
myLibFunction("foo");
```

```lua
myLibFunction("foo")
```

</SideBySide>

This works on methods as well, which can be useful if you have class methods which should be called with a dot `.` instead of a colon `:`.

**Example**

<SideBySide>

```typescript
declare class MyClass {
  withContext(arg: string): void;
  withoutContext(this: void, arg: string): void;
}
const c = new MyClass();
c.withContext("foo");
c.withoutContext("foo");
```

```lua
local c = __TS__New(MyClass)
c:withContext("foo") -- uses colon :
c.withoutContext("foo") -- uses dot .
```

</SideBySide>

Another common scenario is a library function which takes a lua callback function, which should not have a context parameter.

**Example**

<SideBySide>

<!-- prettier-ignore -->
```typescript
declare function takesCallback(
  this: void,
  callback: (this: void, arg: string) => void,
): void;

takesCallback(arg => {
  console.log(arg);
});
```

```lua
takesCallback(function(arg) print(arg) end)
```

</SideBySide>

## `@noSelf`

If you wish to specify that all functions in a class, interface or namespace should not have a context parameter, you can use the [`@noSelf`](compiler-annotations.md#noself) directive.

**Example**

<SideBySide>

```typescript
/** @noSelf **/
declare namespace MyNamespace {
  function myFunction(arg: string): void;
}
MyNamespace.myFunction("foo");
```

```lua
MyNamespace.myFunction("foo")
```

</SideBySide>

You can override `@noSelf` on a per-function basis by specifying a `this` parameter.

**Example**

<SideBySide>

```typescript
/** @noSelf **/
declare namespace MyNamespace {
  function myFunction(this: any, arg: string): void;
}
MyNamespace.myFunction("foo");
```

```lua
MyNamespace:myFunction("foo")
```

</SideBySide>

## `@noSelfInFile`

If you want to specify that all functions in a file should have no context, you can use [`@noSelfInFile`](compiler-annotations.md#noselfinfile) at the top of the file.

For more information on [`@noSelf`](compiler-annotations.md#noself) and [`@noSelfInFile`](compiler-annotations.md#noselfinfile), please refer to [Compiler Annotations](compiler-annotations).

# Assignment Errors

Functions that have a context parameter cannot be assigned to functions that do not, and vice-versa. A common case where this may occur is passing a callback to an api that expects a function that does not take an initial argument.

**Example**

```ts
declare function takesCallback(callback: (this: void, arg: string) => void);

function myCallback(arg: string) {}
takesCallback(myCallback); // Error: Unable to convert function with a 'this' parameter to function with no 'this'. To fix, wrap in an arrow function, or declare with 'this: void'.
```

This throws an error because if `takesCallback` called `myCallback`, it would do so without passing an initial context parameter. This can be easily fixed simply by wrapping the call in an arrow function.

**Example**

<SideBySide>

```typescript
takesCallback(arg => myCallback(arg));
```

```lua
takesCallback(function(arg) return myCallback(nil, arg) end)
```

</SideBySide>

The reason this works is because TypeScriptToLua infers whether the arrow function should take a context parameter or not based on the type it's being assigned to.

## Overloads

If a function is overloaded and the signatures differ in context type, you can not assign them:

```ts
declare function takesFunction(f: Function): void;

declare function myFunction(this: void, s: string, n: number): void;
declare function myFunction(s: string);

takesFunction(myFunction); // Error: Unsupported assignment of function with different overloaded types for 'this'. Overloads should all have the same type for 'this'.
```

It's best practice to avoid overloads with different context types.
