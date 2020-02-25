---
title: Functions and the `self` Parameter
---

# Every Function Has a Context Parameter

In JavaScript and TypeScript, almost all functions have access to an implicit `this` parameter. In order to maintain compatibility with this, all Lua functions are generated with an extra initial context parameter.

**Example**

```typescript
function myFunction(arg: unknown) {}
myFunction("foo");
```

```lua
function myFunction(self, arg)
end
myFunction(nil, "foo")
```

The reason for this is that a method can be assigned to a stand-alone function and vice-versa.

**Example**

```typescript
class MyClass {
  myMethod(arg: unknown) {
    console.log("myMethod", arg);
  }
}
var myFunction = function(arg: unknown) {
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

```typescript
declare function myLibFunction(arg: unknown): void;
myLibFunction("foo");
```

```lua
myLibFunction(nil, "foo")
```

# Removing the Context Parameter

When dealing with external library functions that don't expect this initial parameter, you will need to inform TypeScriptToLua. This can be done a few different ways.

## `this: void`

You can declare any function with `this: void` to prevent generation of this initial argument.

**Example**

```typescript
declare function myLibFunction(this: void, arg: unknown): void;
myLibFunction("foo");
```

```lua
myLibFunction("foo")
```

This works on methods as well, which can be useful if you have class methods which should be called with a dot `.` instead of a colon `:`.

**Example**

```typescript
declare class MyClass {
  myMethodWithContext(arg: unknown): void;
  myMethodWithoutContext(this: void, arg: unknown): void;
}
const c = new MyClass();
c.myMethodWithContext("foo");
c.myMethodWithoutContext("foo");
```

```lua
local c = MyClass.new()
c:myMethodWithContext("foo") -- uses colon :
c.myMethodWithoutContext("foo") -- uses dot .
```

Another common scenario is a library function which takes a lua callback function, which should not have a context parameter.

**Example**

```typescript
type Callback = (this: void, arg: unknown) => void;
declare function takesCallback(this: void, callback: Callback): void;
takesCallback(arg => {
  console.log(arg);
});
```

```lua
takesCallback(function(arg) print(arg) end)
```

## `@noSelf`

If you wish to specify that all functions in a class, interface or namespace should not have a context parameter, you can use the [`@noSelf`](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Compiler-Directives#noself) directive.

**Example**

```typescript
/** @noSelf **/
declare namespace MyNamespace {
  export function myFunction(arg: unknown): void;
}
MyNamespace.myFunction("foo");
```

```lua
MyNamespace.myFunction("foo")
```

You can override `@noSelf` on a per-function basis by specifying a `this` parameter.

**Example**

```typescript
/** @noSelf **/
declare namespace MyNamespace {
  export function myFunction(this: any, arg: unknown): void {}
}
MyNamespace.myFunction("foo");
```

```lua
MyNamespace:myFunction("foo")
```

## `@noSelfInFile`

If you want to specify that all functions in a file should have no context, you can use [`@noSelfInFile`](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Compiler-Directives#noselfinfile) at the top of the file.

For more information on [`@noSelf`](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Compiler-Directives#noself) and [`@noSelfInFile`](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Compiler-Directives#noselfinfile), please refer to [Compiler Directives](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Compiler-Directives).

# Assignment Errors

Functions that have a context parameter cannot be assigned to functions that do not, and vice-versa. A common case where this may occur is passing a callback to an api that expects a function that does not take an initial argument.

**Example**

```ts
declare function takesCallback(callback: (this: void, arg: string) => void);

function myCallback(arg: string) {}
takesCallback(myCallback); // Error: Unable to convert function with a 'this' parameter to function with no 'this'. To fix, wrap in an arrow function, or declare with 'this: void'.
```

This throws an error because if takesCallback called myCallback, it would do so without passing an initial context parameter. This can be easily fixed simply by wrapping the call in an arrow function.

**Example**

```typescript
takesCallback(arg => myCallback(arg));
```

```lua
takesCallback(function(arg) return myCallback(nil, arg) end)
```

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
