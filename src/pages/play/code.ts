import lzstring from "lz-string";

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

export function getInitialCode() {
    if (window.location.hash.startsWith("#src=")) {
        const code = window.location.hash.replace("#src=", "").trim();
        return decodeURIComponent(code);
    }

    if (window.location.hash.startsWith("#code/")) {
        const code = window.location.hash.replace("#code/", "").trim();
        return lzstring.decompressFromEncodedURIComponent(code) || "";
    }

    return example;
}

export function updateCodeHistory(code: string) {
    const hash = `code/${lzstring.compressToEncodedURIComponent(code)}`;
    window.history.replaceState({}, "", `#${hash}`);
}

export function getPlaygroundUrlForCode(code: string) {
    return `/play/#code/${lzstring.compressToEncodedURIComponent(code)}`;
}
