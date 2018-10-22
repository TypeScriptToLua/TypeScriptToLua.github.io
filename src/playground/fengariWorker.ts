import {lauxlib, lua, lualib, to_jsstring, to_luastring, interop } from "fengari-web";

declare var self: any;

function executeLua(luaStr: string): any {
    // clear print buffer and patch lua print
    self.printStream = "";
    const printToGlobal = `
local js = require "js"
local oldPrint = print
_G.print = function(...)
    local elements = table.pack(...)
    for i = 1, elements.n do
      js.global.printStream = js.global.printStream .. tostring(elements[i]) .. "\\t"
    end
    js.global.printStream = js.global.printStream .. "\\n"
end
`;

    luaStr = printToGlobal + luaStr;

    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), interop.luaopen_js, 1);
    lua.lua_pop(L, 1);
    const status = lauxlib.luaL_dostring(L, to_luastring(luaStr));

    if (status === lua.LUA_OK) {
        // Read the return value from stack depending on its type.
        if (lua.lua_isboolean(L, -1)) {
            return lua.lua_toboolean(L, -1);
        } else if (lua.lua_isnil(L, -1)) {
            return null;
        } else if (lua.lua_isnumber(L, -1)) {
            return lua.lua_tonumber(L, -1);
        } else if (lua.lua_isstring(L, -1)) {
            return lua.lua_tojsstring(L, -1);
        } else {
            throw new Error("Unsupported lua return type: " + to_jsstring(lua.lua_typename(L, lua.lua_type(L, -1))));
        }
    } else {
        // If the lua VM did not terminate with status code LUA_OK an error occurred.
        // Throw a JS error with the message, retrieved by reading a string from the stack.

        // Filter control characters out of string which are in there because ????
        throw new Error("LUA ERROR: " + to_jsstring(lua.lua_tostring(L, -1).filter((c: number) => c >= 20)));
    }
}

onmessage = (event: MessageEvent) => {
    executeLua(event.data.luaStr);
    postMessage({luaPrint: self.printStream});
};