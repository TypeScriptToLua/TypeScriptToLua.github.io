---
title: External Lua Code
---

As of `0.40.0`, tstl supports module resolution for libraries, which means you can _use_ and _create_ npm packages containing `.lua` files. You can also include Lua source files directly into your source code.

## Adding Lua files to your project sources

You can simply add a Lua file as part of your project sources if you add [a declaration file](./advanced/writing-declarations.md) with the same name. You can then simply import the Lua code in your TypeScript. Your project should look like:

```
main.ts
somelua.lua
somelua.d.ts
tsconfig.json
```

## Using NPM packages

To use a Lua package, install it via npm and use it as you would for any regular npm package in TypeScript. If the package does not include its own `.d.ts` declaration files, you can create your own by adding a `<package name>.d.ts` [declaration file](./advanced/writing-declarations.md) to your source files.

:::note
Including TS or JS files from npm packages is currently NOT supported.
:::

## Creating Lua NPM packages

If you want to distribute your tstl created Lua as a library, you will need to enable the library build mode in `tsconfig.json`, and enable the output of declaration files:

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
Currently, projects using `"buildMode": "library"` tsconfig setting must also have the `luaBundle` setting turned off. (However, you can still _consume_ unbundled libraries in projects that use `luaBundle` without any problems.)
:::

## Example projects

For example projects using external Lua, you can look at the projects used in the TypeScriptToLua tests:

### [A project using Lua from node_modules packages](https://github.com/TypeScriptToLua/TypeScriptToLua/tree/master/test/transpile/module-resolution/project-with-node-modules)

A project using dependencies from its [node_modules directory](https://github.com/TypeScriptToLua/TypeScriptToLua/tree/master/test/transpile/module-resolution/project-with-node-modules/node_modules) with Lua code. These example dependencies include:

- `lua-global-with-decls`: Lua code + TypeScript declarations defining global functions.
- `lua-global-without-decls`: Lua code defining global functions.
  - Declaration file is added manually in [lua-global-without-decls.d.ts in the project sources](https://github.com/TypeScriptToLua/TypeScriptToLua/tree/master/test/transpile/module-resolution/project-with-node-modules).
- `lua-module-with-decls`: Lua code + TypeScript declarations for 'module' files, i.e Lua files that return a table of exported functions.
- `lua-module-with-decls`: Lua code for 'module' files, i.e Lua files that return a table of exported functions.
  - Declaration files are added manually in [lua-module-without-decls.d.ts in the project sources](https://github.com/TypeScriptToLua/TypeScriptToLua/tree/master/test/transpile/module-resolution/project-with-node-modules).

### [A project with Lua sources](https://github.com/TypeScriptToLua/TypeScriptToLua/tree/master/test/transpile/module-resolution/project-with-lua-sources)

This project includes Lua files as part of the project's source files. To use the Lua from the files you have to provide declaration files with a matching name and location for each file. For examples `some_dir/library.lua` & `some_dir/library.d.ts`. The declaration files contain the TypeScript declarations of the corresponding Lua file. Both Lua and .d.ts files should be checked into your repository!

This project contains two Lua source files:

- `luafile.lua`: Some Lua right next to the .ts files using it.
- `lua_sources/otherluaFile.lua`: Lua in a separate `lua_sources` directory, in case you want to group all your Lua files into one directory.
