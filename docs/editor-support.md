---
title: Editor Support
---

To have basic support for TypeScriptToLua it is enough to [configure your editor for TypeScript support](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support).

## Language Service Plugin

Sometimes TypeScriptToLua has to report it's own errors during the compilation. To have the same errors displayed in your editor, you can use a [language service plugin](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin).

![Autocomplete popup from Visual Studio Code with a TypescriptToLua specific error.](/images/editor-support-diagnostics.png)

To use it either get a [Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=typescript-to-lua.vscode-typescript-to-lua) or [add it to your project](https://github.com/TypeScriptToLua/typescript-tstl-plugin#installation).

## Build Tasks

Most of advanced code editors can build your project with [npm scripts](https://docs.npmjs.com/misc/scripts).

```json title=package.json
{
  "scripts": {
    "build": "tstl",
    "dev": "tstl --watch"
  }
}
```

### Visual Studio Code

VSCode supports running npm scripts using [tasks](https://code.visualstudio.com/docs/editor/tasks). To define a task, create a `.vscode/tasks.json` file or press `F1` and run `Tasks: Configure Task` command. Example configuration:

```json title=tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "dev",
      "problemMatcher": "$tsc-watch",
      "isBackground": true,
      "presentation": { "reveal": "never" },
      "group": { "kind": "build", "isDefault": true }
    }
  ]
}
```
