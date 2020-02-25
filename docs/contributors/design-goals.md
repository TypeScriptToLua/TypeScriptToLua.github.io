---
title: Project Design Goals
---

The design goals of this project can be summarized in the following sentence:

> TypeScriptToLua aims to transpile valid TypeScript and declarations to working Lua for any Lua version and platform API.

Ofcourse there are several nuances to be taken into account here, as will be discussed on the rest of this page.

## Declarations First

The main goal of this project is for it to be applicable to any Lua environment and API. This means the process of declaring platform APIs and existing Lua functionality are central in the design of the transpiler. As a result of this, TypeScriptToLua supports several [Compiler directives](https://github.com/Perryvw/TypescriptToLua/wiki/Compiler-Directives) that affect the resulting Lua to better match API declarations.

## Functional equivalence Lua/JavaScript

Code written in TypeScript can be transpiled into both JavaScript and Lua. It would therefore be reasonable to expect that two programs with the same source are functionally equivalent: this is **NOT** the case.

We aim to keep the functionality between transpiled JavaScript and Lua equivalent as much as possible. However, since JavaScript and Lua are fundamentally differences, equivalence of functionality can not be guaranteed. See [Differences between Lua and JavaScript](https://github.com/Perryvw/TypescriptToLua/wiki/Differences-between-Lua-and-Javascript) for more details.

We will try to stay functionally equivalent as much as possible, but not at all costs. If the workaround needed to support equivalent JavaScript functionality is too complex or flawed, we may accept slightly different functionality in Lua compared to JavaScript. A list of such limitations can be found here: [Limitations](https://github.com/Perryvw/TypescriptToLua/wiki/Limitations).

## Optimization strategy

Since this project aims to be usable in any Lua environment, it can not optimize in any direction. We also value readable (and understandable) Lua output. We obviously aim for the best performance, but balancing all of the previously mentioned concerns.
