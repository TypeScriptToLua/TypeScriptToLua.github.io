---
title: The self parameter
---

import { SideBySide } from "@site/src/components/SideBySide";

## Why is it there by default

All functions, by default, have a `self` parameter to preserve JavaScript behaviour.

Telling TypeScript not to allow `this` to be used will eliminate that parameter from its containing context.

Other workarounds are available for removing this too.

## Removing it

### `noImplicitSelf`

Use this option if you do not want implemented functions to have a self parameter.

Ambient functions (functions described, not implemented) as well as classes and interfaces ignore this option.

:::note
Use this with `strict` or `noImplicitThis` to ensure you don't use an "implicit this" type in your code.
:::

_When enabled, if `this` has a type other than an implicit `any`, a `self` parameter will be added for its containing function._

```json title=tsconfig.json
{
  "tstl": {
    "noImplicitSelf": true
  }
}
```

<SideBySide>

```typescript
function f() {}
function f2(this: any) {}
const a = () => {};
class C {
  method() {}
}
```

```lua
function f() end
function f2(self) end
local a = function() end

local C = __TS__Class()
function C:method(self) end -- still has self
```

</SideBySide>

### `this: void`

This is a type-safe solution usable whenever describing something callable.

This tells TypeScript that `this` cannot be used in the context of this function.

`this: void` results in no `self` parameter to be generated.

**Example**

<SideBySide>

```typescript
declare function f(this: void, arg: string): void;
f("foo");
```

```lua
f("foo")
```

</SideBySide>

Also useful if you have class methods which should be called with a dot `.` instead of a colon `:`.

**Example**

<SideBySide>

```typescript
declare class Class {
  colon(arg: string): void;
  dot(this: void, arg: string): void;
}

const c = new Class();
c.colon("foo");
c.dot("foo");
```

```lua
local c = __TS__New(Class)
c:colon("foo")
c.dot("foo")
```

</SideBySide>

Common Lua libraries use callback functions that don't have a `self` parameter so make sure this is reflected in their declaration.

**Example**

<SideBySide>

<!-- prettier-ignore -->
```typescript
type Callback = (
  this: void,
  arg: string
) => void;

declare function useCallback(
  this: void,
  callback: Callback
): void;

useCallback(arg => {
  console.log(arg);
});
```

```lua
useCallback(function(arg)
  print(arg)
end)
```

</SideBySide>

## Removing it via annotations

### `@noSelf`

If you wish to specify that all functions in a class, interface or namespace should not have a context parameter, you can use the [`@noSelf`](../advanced/compiler-annotations.md#noself) annotation.

**Example**

<SideBySide>

```typescript
/** @noSelf **/
declare namespace Namespace {
  function foo(arg: string): void;
}

Namespace.foo("foo");
```

```lua
Namespace.foo("foo")
```

</SideBySide>

You can override `@noSelf` on a per-function basis by specifying a `this` parameter.

**Example**

<SideBySide>

```typescript
/** @noSelf **/
declare namespace Namespace {
  function foo(this: any, arg: string): void;
}

Namespace.foo("foo");
```

```lua
Namespace:foo("foo")
```

</SideBySide>

### `@noSelfInFile`

If you want to specify that all functions in a file should have no context, you can use [`@noSelfInFile`](../advanced/compiler-annotations.md#noselfinfile) at the top of the file.

For more information on [`@noSelf`](../advanced/compiler-annotations.md#noself) and [`@noSelfInFile`](../advanced/compiler-annotations.md#noselfinfile), please refer to [Compiler Annotations](../advanced/compiler-annotations).

## Assignment Errors

See the two types below.

```typescript
type NoContext = (this: void) => void;
type UseContext = () => void;
```

TypeScript sees `NoContext` to be assignable to `UseContext`.

TypeScriptToLua does not.

**Example**

```ts
declare function useCallback(cb: (this: void, arg: string) => void);
// cb's type: (this: void, arg: string) => void

function callback(arg: string) {}
// callback's type: (arg: string) => void (implicit any)

useCallback(callback);
```

> :x: **Error:** Unable to convert function with a 'this' parameter to function with no 'this'. To fix, wrap in an arrow function, or declare with 'this: void'.

This throws an error because `callback's type` is not assignable to `cb's type` since the latter has an implicit any type which changes how the function should be called.

To fix this, an arrow function can be used.

**Example**

<SideBySide>

```typescript
useCallback((arg) => callback(arg));
// argument type: (this: void, arg: string) => void
```

```lua
useCallback(function(arg)
  return callback(nil, arg)
end)
```

</SideBySide>

TypeScript says the arrow function has no context due to the parameter's signature making TypeScriptToLua accept the parameter.

### Overloads

A similar error occurs if a function is overloaded and the call signature differs between how to use context:

```ts
declare function useCallback(f: () => {}): void;

declare function callback(this: void, s: string, n: number): void;
declare function callback(s: string);

useCallback(callback);
```

> :x: **Error:** Unsupported assignment of function with different overloaded types for 'this'. Overloads should all have the same type for 'this'.

It's best practice to avoid overloads with different context types.
