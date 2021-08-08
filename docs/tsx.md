---
title: TSX
---

As of version `0.42.0`, TypeScriptToLua supports the use of TSX. To enable it, add `"jsx": "react"` to your tsconfig - other values are not supported. It is your job to make sure the required factory functions are available in the Lua environment.

```json title=tsconfig.json
{
    "compilerOptions": {
        ...
        "jsx": "react",
        ...
    },
}
```

TSX will be translated to lua as it would be translated to JS:

```typescript
const element = <div a={b}>Inner text!</div>;
```

Will become:

```lua
local element = React.createElement("div", {a = b}, "Inner text!");
```

## Custom factory functions

It is possible to supply custom factory functions using the `jsxFactory` tsconfig setting or `/** @jsx */` annotation.

### jsxFactory tsconfig example

```json title=tsconfig.json
{
    "compilerOptions": {
        ...
        "jsx": "react",
        "jsxFactory": "MyNamespace.MyCreate"
        ...
    },
}
```

```typescript
const element = <div a={b}>Inner text!</div>;
```

Will translate to:

```lua
local element = MyNamespace.MyCreate("div", {a = b}, "Inner text!");
```

### @jsx annotation example

Note: the annotation MUST be at the top of the file!

```typescript
/** @jsx MyNamespace.MyCreate */
const element = <div a={b}>Inner text!</div>;
```

Will translate to:

```lua
local element = MyNamespace.MyCreate("div", {a = b}, "Inner text!");
```

## jsxFragmentFactory

You can also provide a customfragment using the `jsxFragmentFactory` tsconfig setting or `/** @jsxFrag */` annotation.

### jsxFragmentFactory tsconfig example

```json title=tsconfig.json
{
    "compilerOptions": {
        ...
        "jsx": "react",
        "jsxFactory": "MyNamespace.MyCreate",
        "jsxFragmentFactory": "MyNamespace.MyFragment"
        ...
    },
}
```

```typescript
const element = <></>;
```

Will translate to:

```lua
local element = MyNamespace.MyCreate(MyNamespace.MyFragment, {});
```

### @jsxFrag annotation example

Note: the annotation MUST be at the top of the file!

```typescript
/** @jsx MyNamespace.MyCreate */
/** @jsxFrag MyNamespace.MyCreate */
const element = <></>;
```

Will translate to:

```lua
local element = MyNamespace.MyCreate(MyNamespace.MyFragment, {});
```
