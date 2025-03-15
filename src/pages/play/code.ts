import lzstring from "lz-string";
import { LuaTarget } from "typescript-to-lua";

const example = `// Declare exposed API
type Vector = [number, number, number];

declare function findUnitsInRadius(this: void, center: Vector, radius: number): Unit[];
declare interface Unit {
    isFriend(other: Unit): boolean;
    givePoints(pointsAmount: number): void;
}


// Use declared API in code
function onAbilityCast(this: void, caster: Unit, targetLocation: Vector) {
    const units = findUnitsInRadius(targetLocation, 500);
    const friends = units.filter(unit => caster.isFriend(unit));

    for (const friend of friends) {
        friend.givePoints(50);
    }
}
`;
const defaultTarget = LuaTarget.Lua54;

export function getInitialCode(): [string, LuaTarget] {
    if (window.location.hash.startsWith("#src=")) {
        const code = window.location.hash.replace("#src=", "").trim();
        return [decodeURIComponent(code), defaultTarget];
    }

    if (window.location.hash.startsWith("#code/")) {
        const code = window.location.hash.replace("#code/", "").trim();
        if (code.includes("/")) {
            const split = code.split("/");
            return [lzstring.decompressFromEncodedURIComponent(split[1]) ?? "", split[0] as LuaTarget];
        } else {
            return [lzstring.decompressFromEncodedURIComponent(code) ?? "", defaultTarget];
        }
    }

    return [example, defaultTarget];
}

function urlEncode(code: string, target: LuaTarget) {
    return `${target}/${lzstring.compressToEncodedURIComponent(code)}`;
}

export function updateCodeHistory(code: string, target: LuaTarget) {
    const hash = `code/${urlEncode(code, target)}`;
    window.history.replaceState({}, "", `#${hash}`);
}

export function getPlaygroundUrlForCode(code: string, target: LuaTarget) {
    return `/play/#code/${urlEncode(code, target)}`;
}
