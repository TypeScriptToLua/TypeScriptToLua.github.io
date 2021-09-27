---
title: Automated Testing
---

import { SideBySide } from "@site/src/components/SideBySide";
import { DeprecatedInVersion } from "@site/src/components/DeprecatedInVersion";

This guide is going to explore unit testing, it’s assuming some familiarity with the subject, but it’s not required.

So to start off, you’re gonna need some project set up, the specifics don’t really matter, you can just take these ideas and extrapolate them to your own needs, but for demonstration I’m going to have a basic project set up like this:

![Project setup](/images/testing-project-setup.png)

Our code is very simple for this example.

```typescript title=index.ts
export const libraryFunction = (param: number[], reverse: boolean) => {
    let reversed: number[] = [];

    if (reverse) {
        param.forEach((n) => table.insert(reversed, 1, n));
    } else {
        reversed = param;
    }

    return table.concat(reversed, ',');
}
```

So our function takes an array of numbers like “[1,2,3,4]” and returns a string like “1,2,3,4” or “4,3,2,1”This is where unit testing comes in, say a piece of code depends on this function working like it does, and for it to keep working exactly like it does right now, obviously you could use the tried and true method of doing the testing yourself, but unit testing provides an alternative to the manual work.

So, automated testing, where do we begin?

To start off we’re going to need these tools installed:

https://luarocks.org/
&
https://olivinelabs.com/busted/

*Luarocks is known to be hard to impossible to install on Windows systems sucessfully, if that’s the case for you, definitely keep reading on, we’re gonna explore a (free) option to do away with running tests locally entirely.*

Now that we have busted installed and the `busted` command runs in your terminal of choice successfully we can proceed.

Let’s quickly install busted typings like so `npm install -d busted-tstl`

And we need to add busted-tstl types to our tsconfig.json, you should already have a section like this:

```json title=tsconfig.json
"types": [
  "typescript-to-lua/language-extensions",
  "lua-types/jit",
]
```
Simply add `"busted-tstl"` :

```json title=tsconfig.json
"types": [
  "typescript-to-lua/language-extensions",
  "lua-types/jit",
  "busted-tstl"
]
```

Now let’s set up a folder for our tests, by default busted takes a folder named `spec` and runs the files in there, now
this is personal preference, but usually I name my tests `[filename to be tested]_spec.ts`, the _spec suffix is once again what busted searches for by default, so we’ll stick to that.

Now our project should look something like this:

![Project setup](/images/testing-project-setup-with-spec-folder.png)

Alright, we can start writing our first test. Let’s explore the following example briefly:

```typescript title=index_spec.ts
import { libraryFunction } from "..";

describe('Library Function',() => {
    it('Returns unreversed string correctly',() => {
        assert.is_equal('1,2,3,4', libraryFunction([1, 2, 3, 4], false));
    });
})
```

So the short version of what’s happening there is the ‘describe’ block is our named collection of tests, this block pertains to the library function and library function alone, next we call it(‘’,()=>{}) in there to name and describe the behaviour of a single test, it’s a regular function so you can call and do anything in there. Right here, we’re just using a function in the assert namespace which passes the test if the 2 parameters are exactly equal, and fails if they’re different.

Alright, so we call our libraryFunction with a set of parameters, and get back some return, then we assert that the return value is equal to a known (correct) value. For illustration let’s add another test, since we have a second signature of the function that returns a reversed string, we can try that:

```typescript title=index_spec.ts
import { libraryFunction } from "..";

describe('Library Function',() => {
    it('Returns unreversed string correctly',() => {
        assert.is_equal('1,2,3,4', libraryFunction([1, 2, 3, 4], false));
    });
    it('Returns unreversed string correctly',() => {
        assert.is_equal('4,3,2,1', libraryFunction([1, 2, 3, 4], true));
    });
})
```

Now hit compile and change your terminal’s directory in to your tstl output folder, for me it’s the `dist` folder.
We can now just simply run `busted`, and you should see something like this:

![Project setup](/images/busted-output.png)

2 tests succeeded, so our code is working as expected for these 2 scenarios, of course these aren’t exhaustive, for some real functionality they would be more exhaustive, more scenarios and validation, but this should set you on your tracks of busted testing your code.

Now we can move on to the next topic

## Automating the testing

For this we’re going to use the free tools provided by GitHub to every public(and most private?) repository, this assumes you already have a git repository hosted on GitHub, if you need help doing that I can point you to their exhaustive docs:

https://docs.github.com/en/get-started/quickstart

And also the documentation about actions specifically:

https://docs.github.com/en/actions

So, first we’re going to create a workflow file

Set up a folder structure like so:
```
Root project folder/
  .github/
    workflows/
      testing.yml
```

```yaml title=testing.yml
name: TSTL Testing

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build_tests:
    name: Busted Tests
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js [16.x]
      uses: actions/setup-node@v2
      with:
        node-version: 16.x
        cache: 'npm'
    - name: Npm Install && Build with Testing preset
      run: npm install && npm run-script build
    - name: Install Lua
      uses: leafo/gh-actions-lua@v8
      with:
        luaVersion: "luajit-2.1.0-beta3"
    - name: Install LuaRocks
      uses: leafo/gh-actions-luarocks@v4.0.0
    - name: Install Busted
      run: luarocks install busted
    - name: Running Tests
      run: cd dist && busted
```

Without going in to much detail, this workflow triggers whenever you push a commit to your github repository, installs Node.js, Lua, Luarocks and Busted installs all of your project dependencies and compiles a fresh version of the project, at the very end it moves in to the dist folder and runs your busted tests exactly like you would. Now, if you commit and push these changes to your GitHub repository you should be able to see, Under the Actions tab at the top, something like this:

![Github action result](/images/github-workflow-result.png)

Now that’s just it, this job will run every time you push a new commit to the repository, if it fails it’ll show up as a red cross, and you can find which test failed in the logs.

## TSTL Library specifics

This section applies to projects described in [Publishing Modules](publishing-modules.md), as you might know, library projects don’t (and shouldn’t) include the luaLibBundle and also any dependencies it would need to run, so how do we make it run standalone, for testing, we’re going to utilize the fact that you can pass in a different `tsconfig.json` to the compiler, so, the regular one is implicitly used based on the name `tsconfig.json`, we’re going to create a new one like `tsconfig.test.json` you can pretty much duplicate it from your current one, we’re just going to change a few values:

```json title=tsconfig.test.json
{
  "compilerOptions": {
    "lib": ["esnext"],
    "rootDir": "src",
    "outDir": "dist" => "testing",
    "target": "esnext",
    "moduleResolution": "node",
    "types": [
      "typescript-to-lua/language-extensions",
      "lua-types/jit",
      "busted-tstl"
    ],
    "declaration": true,
    "noImplicitAny": true,
  },
  "tstl": {
    "luaLibImport": "none" => "require",
    "buildMode": "library" => "default",
    "luaTarget": "JIT",
    "noImplicitSelf": true,
    "sourceMapTraceback": false
  }
}
```
*(arrows are to indicate the changes, don't include them in the actual code)*

Now you can use this new tsconfig like: `tstl —project tsconfig.test.json`

It will output the new build in to the testing folder and you can move your terminal in to the folder and run busted

Then you can edit your `package.json` file and add a new task:

```json title=package.json
"scripts": {
  "build": "tstl",
  + "test-build": "tstl --project tsconfig.test.json",
  "dev": "tstl --watch"
},
```

Next we’ll edit our GitHub actions workflow file to work with this new command like so:

```yaml title=testing.yml
name: TSTL Testing

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build_tests:
    name: Busted Tests
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js [16.x]
      uses: actions/setup-node@v2
      with:
        node-version: 16.x
        cache: 'npm'
    - name: Npm Install && Build with Testing preset
      run: npm install && npm run-script test-build
    - name: Install Lua
      uses: leafo/gh-actions-lua@v8
      with:
        luaVersion: "luajit-2.1.0-beta3"
    - name: Install LuaRocks
      uses: leafo/gh-actions-luarocks@v4.0.0
    - name: Install Busted
      run: luarocks install busted
    - name: Running Tests
      run: cd testing && busted
```

Now your build should include all the Lua libraries you installed with npm/yarn, include the lualib bundle file and the GitHub action should work.

## An Example Repository

If some things are still unclear you can always check a repository that followed this guide: https://github.com/qeffects/tstl-testing
