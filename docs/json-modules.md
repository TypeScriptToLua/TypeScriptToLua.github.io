---
title: Importing JSON Modules
---

TypeScriptToLua supports importing JSON files into your TypeScript. This is done by translating the JSON file to Lua and simply including this Lua file as part of the transpiler output.

# Example

Consider the following project files:


```
./
├── main.ts
├── myjsondata.json
└── tsconfig.json
```

## Modifying tsconfig.json

To be able to import JSON files you have to enable the `resolveJsonModule` option in tsconfig.json, and set `moduleResolution` to node:

```json title=tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

## Json data

The file containing JSON is just standard JSON:

```json title=myjsondata.json
{
    "property1": "foo",
    "property2": "bar"
}
```

## Importing JSON data

Now to access your data, simply import it from your TS file:

```ts title=main.ts
import * as myJson from "./myjsondata.json";

const p1 = myJson.property1;
```
