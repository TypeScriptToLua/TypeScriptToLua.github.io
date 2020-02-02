const example = `// Declare exposed API
type Vector = [number, number, number];

declare function findUnits(this: void, center: Vector, radius: number): Unit[];
declare interface Unit {
    isEnemy(other: Unit): boolean;
    kill(): void;
}


// Use declared API in code
function onAbilityCast(this: void, caster: Unit, targetLocation: Vector) {
    const units = findUnits(targetLocation, 500);
    const enemies = units.filter(unit => caster.isEnemy(unit));

    for (const enemy of enemies) {
        enemy.kill();
    }
}
`;

export function getInitialCode() {
    if (window.location.hash.startsWith("#src=")) {
        const code = window.location.hash.replace("#src=", "").trim();
        return decodeURIComponent(code);
    }

    return example;
}

let ignoreHashChange = false;
window.onhashchange = () => {
    if (ignoreHashChange) {
        ignoreHashChange = false;
        return;
    }
};

export function updateCodeHistory(code: string) {
    window.location.replace("#src=" + encodeURIComponent(code));
    ignoreHashChange = true;
}
