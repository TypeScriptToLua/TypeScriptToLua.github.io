---
title: Publishing Modules
---

As of `0.40.0`, tstl supports module resolution for libraries, which means you can _use_ and _create_ npm packages containing `.lua` files. You can also include Lua source files directly into your source code.

- You cannot import `.ts` and `.tsx` source files
- You must use `"buildMode": "library"`
- It is recommended you use `"declaration": true`
- You cannot use `"luaBundle"`

## Project Configuration

Your `tsconfig.json` file must at least specify the following...

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

And your `package.json` file should specify the `types` property. You should also specify the `main` property if your module contains runnable Lua code.

```json title=package.json
{
  "main": "./dist/index", // points to ./dist/index.lua
  "types": "./dist/index" // points to ./dist/index.d.ts
}
```

These must be __relative__ paths within your module __without__ the file's extension.

> These are set to `"index"` by default so if you _really_ don't want to specify these you can keep an `index.d.ts` and `index.lua` file at the top level of your package.

## Publishing

Within your `package.json` you can specify the `files` field to mark what files to publish.

This is useful if you don't want to publish your source code.

```json title=package.json
{
  "files": [
    "dist/**/*.lua",  // publish all Lua files in /dist/
    "dist/**/*.d.ts"  // publish all declaration files in /dist/
  ]
}
```

You can use `npm publish --dry-run` to see what files would be published without publishing your package.

- Some files will always be published e.g. `package.json`, `README.md`.
- Modules specified in `"devDependencies"` will not be available to the module at runtime.
- The `tsconfig.json` file does nothing for users of your module.

And when you're happy, your `package.json` has a `name`, `version`, `description`, and you are logged into NPM on your machine... you can run `npm publish` to publish your module.

## Using the Module

Assuming the module is available on NPM, users of your module can download it like so.

```bash
npm install <package-name>
# OR
yarn add <package-name>
```

Now they can start using it.

```ts title=example.ts
import { func } from "<package-name>";

func();
```

TypeScriptToLua will handle the module resolution from here.

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
