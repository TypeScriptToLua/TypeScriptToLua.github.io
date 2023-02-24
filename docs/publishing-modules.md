---
title: Publishing Modules
---

There are three kinds of `tstl` libraries published on npm:

- **Type declaration libraries** - Provides only _ambient_ types. In other words, these libraries do not contain any code which can be executed.
- **Lua libraries** - Provides Lua code that can be imported and executed by `tstl` projects.
- **Mixed** - Provides **both** type declarations and Lua code at the same time. (These kinds of libraries are less common.)

This page describes how to create a Lua package and publish it to npm.

## Basic Limitations

- You cannot import `.ts` and `.tsx` source files.
- You cannot use `"luaBundle"` in packages intended to be included as dependency in another project.

## Project Configuration

Your `tsconfig.json` file must include the following fields:

```json title=tsconfig.json
{
  "compilerOptions": {
    "declaration": true
  },
  "tstl": {
    "buildMode": "library"
  }
}
```

Your `package.json` file should include the following fields:

```json title=package.json
{
  // Only specify "types" if your library is a type declaration library.
  "types": "./dist/index.d.ts",
  // Only specify "main" if your library is a Lua library.
  // (Do NOT include the file extension here, or things will not work properly.)
  "main": "./dist/index"
}
```

:::note
There are many other fields that should be in a proper `package.json` file, such as `name`, `author`, `version`, and so on. Use `npm init` to generate a new `package.json` with some basic fields, if necessary.
:::

## Publishing

The `files` field in the `package.json` file dictates which specific files will be uploaded to npm.

Note that:

- Regardless of the contents of the `files` field, some files will always be published, like `package.json` and `README.md`.
- Modules specified in `"devDependencies"` will not be available to the module at runtime.
- There is no need to publish the `tsconfig.json` file, as it will do nothing for the users of your module.

When you are ready to publish:

- Use `npm login` to cache your npm credentials.
- Use `npm publish --dry-run` to see what files would be published without actually uploading anything.
- Use `npm publish` to actually upload it.

## Using the Module

See [the page on using Lua packages](external-code.md#using-lua-packages).

## Example projects

For an example of a Lua package published to npm, see [`isaacscript-common`](https://github.com/IsaacScript/isaacscript/tree/main/packages/isaacscript-common).

You can also reference the projects used in the TypeScriptToLua tests:

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
