---
title: External Lua Code
---

As of `0.40.0`, tstl supports module resolution for libraries, which means you can _use_ and _create_ npm packages containing `.lua` files. You can also include lua source files directly into your source code.

## Adding Lua files to your project sources

You can simply add a lua file as part of your project sources if you add [a declaration file](./advanced/writing-declarations.md) with the same name. You can then simply import the Lua code in your TypeScript. Your project should look like:

```
main.ts
somelua.lua
somelua.d.ts
tsconfig.json
```

## Using NPM packages

To use a Lua package, simply `npm install` it and use it as you would for any regular npm package in TypeScript. If the package does not include its own `.d.ts` declaration files, you can create your own by adding a `<package name>.d.ts` [declaration file](./advanced/writing-declarations.md) to your source files.

:::note
Including TS or JS files from npm packages is currently NOT supported.
:::

## Creating Lua NPM packages

If you want to distribute your tstl-created Lua as a library, you will need to enable the library build mode in `tsconfig.json`, and enable the output of declaration files:

```json title=json.config
{
    "compilerOptions": {
        ...
        "outDir": "dist", // Output package contents to dist directory
        "declaration": true
    },
    "tstl": {
        ...
        "buildMode": "library"
    }
}
```

Then add or update your `package.json` so it contains the following information:

```json title=package.json
{
  "name": "example-tstl-lua-package",
  "version": "1.0.0",
  "description": "A package created with TypeScriptToLua",
  "scripts": {
    "prepublish": "tstl" // Make sure latest lua is built before publishing
  },
  // Only include dist files
  "files": ["dist/**/*.lua", "dist/**/*.d.ts"]
}
```

With these two files you are now ready to publish your npm package with `npm publish`!

:::warning
Currently, projects using `"buildMode": "library"` cannot be bundled.
:::
