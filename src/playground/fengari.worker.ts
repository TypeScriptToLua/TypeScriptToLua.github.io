import { interop, lauxlib, lua, lualib, to_luastring } from "fengari-web";
import { inspect } from "util";

// TODO: Use different message types
export type LuaMessage = { type: "print"; text: string };

const workerContext = globalThis as typeof globalThis & { printStream: string[] };

const redirectPrintStream = `
    local js = require("js")
    _G.print = function(...)
        local elements = {}
        for i = 1, select("#", ...) do
            table.insert(elements, tostring(select(i, ...)))
        end
        js.global.printStream:push(table.concat(elements, "\\t"))
    end
`;

function transformLuaValue(rootValue: any) {
    const seenLuaValues = new Set<any>();
    function transform(luaValue: any): any {
        if (typeof luaValue !== "function") return luaValue;

        if (luaValue.toString().startsWith("function:")) {
            return { inspect: () => "[Function]" };
        }

        // TODO: Is there some way to get stable reference?
        if (seenLuaValues.has(luaValue.toString())) {
            return { inspect: () => "[Circular]" };
        }

        seenLuaValues.add(luaValue.toString());

        return Object.fromEntries([...luaValue].map(([key, value]) => [key, transform(value)]));
    }

    return transform(rootValue);
}

function executeLua(code: string): LuaMessage[] {
    workerContext.printStream = [];

    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), interop.luaopen_js, 1);
    lua.lua_pop(L, 1);
    lauxlib.luaL_dostring(L, to_luastring(redirectPrintStream));

    const status = lauxlib.luaL_dostring(L, to_luastring(code));
    const messageType = status === lua.LUA_OK ? "Module" : "Error";
    const value = transformLuaValue(interop.tojs(L, -1));

    const messages: LuaMessage[] = workerContext.printStream.map(text => ({ type: "print", text }));
    if (value !== undefined || messageType === "Error") {
        const formattedValue = inspect(value);
        messages.push({ type: "print", text: `${messageType}: ${formattedValue}` });
    }

    return messages;
}

onmessage = (event: MessageEvent) => {
    postMessage({ messages: executeLua(event.data.code) });
};
