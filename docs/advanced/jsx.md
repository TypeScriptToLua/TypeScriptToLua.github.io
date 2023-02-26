---
title: JSX
---

As of version `0.42.0`, TypeScriptToLua supports the use of JSX. To enable it, add `"jsx": "react"` to your tsconfig - other values are not supported.

```json title=tsconfig.json
{
    "compilerOptions": {
        ...
        "jsx": "react",
        ...
    },
}
```

JSX will be translated to lua as Typescript would translate it to JS:

```tsx
const element = <div a={b}>Inner text!</div>;
```

Will become:

```lua
local element = React.createElement("div", { a = b }, "Inner text!");
```

## Custom factory functions

It is possible to supply custom factory functions using the `jsxFactory` tsconfig setting, or on a per-file basis using the `/** @jsx */` annotation.

### Examples

With compiler option:

```json title=tsconfig.json
{
    "compilerOptions": {
        ...
        "jsx": "react",
        "jsxFactory": "MyNamespace.myCreate"
        ...
    },
}
```

or with jsx annotation:

Note: the annotation MUST be at the top of the file!

```tsx
/** @jsx MyNamespace.myCreate */
```

```tsx
const element = <div a={b}>Inner text!</div>;
```

Will translate to:

```lua
local element = MyNamespace.myCreate("div", { a = b }, "Inner text!");
```

For more info on creating your own factory function, see [Creating your own JSX](#creating-your-own-jsx).

## jsxFragmentFactory

JSX fragments are translated as special components.

You can provide a custom fragment component using the `jsxFragmentFactory` tsconfig setting or with the `/** @jsxFrag */` annotation.

### Example

With compiler option:

```json title=tsconfig.json
{
    "compilerOptions": {
        ...
        "jsx": "react",
        "jsxFactory": "MyNamespace.myCreate",
        "jsxFragmentFactory": "MyNamespace.MyFragment"
        ...
    },
}
```

or with `@jsxFrag` annotation:

```tsx
/** @jsx MyNamespace.myCreate */
/** @jsxFrag MyNamespace.MyFragment */
```

```tsx
const element = <></>;
```

Will translate to:

```lua
local element = MyNamespace.myCreate(MyNamespace.MyFragment);
```

## Creating your own JSX

### JSX typings

The types on the jsx factory function itself do _not_ affect how typescript checks JSX types, and no type checking against the jsx factory function is done during transformation.

Instead, typescript looks for types for jsx on the special `JSX` namespace. You can read more creating JSX types [here](https://www.typescriptlang.org/docs/handbook/jsx.html#type-checking).

### JSX factory function

Typescript expects the jsx factory function to be similar to the following:

```ts
function createElement(type: string | Function | Class, props?: object, ...children: any[]): any;
```

- `type` will be a string for intrinsic properties (tag name starts with a lowercase letter), or a function/class component.
- `props` will be the tag properties as an object/table, or `undefined`/`null`/`nil` if no properties are specified.
- The remaining parameters form the `children`, and should be collected with a rest parameter (`...`), and not as one array parameter. The type of the children will be strings for inner text, and values passed directly for JSX expressions and nested elements.
  - No transformations are done on the children parameters, meaning they may have any type (including arrays) that you may need to handle.
  - Using a jsx children spread syntax `<>{...children}</>` does _not_ affect how the children are passed to the createElement function -- it is equivalent to `<>{children}</>`

The function may process in any way and return any value that you wish.

It is recommended that the jsx factory function is in a namespace that is the default export of a module, or that the function itself is the default export of a module, and that the namespace/function name matches the `jsxFactory` compiler option. This is for better integration with tooling (import suggestions). This applies similarly for custom fragment components and the `jsxFragmentFactory` compiler option.
