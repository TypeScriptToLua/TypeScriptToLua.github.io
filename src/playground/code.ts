const example = `/** @noSelfInFile */

// Declare exposed API
type Vector = [number, number, number];

declare interface OnSpellStartEvent {
    caster: Unit;
    targetLocation: Vector;
}

declare class Unit {
    getLevel(): number;
    isEnemy(other: Unit): boolean;
    kill(): void;
}

declare function print(...messages: any[]): void;
declare function FindUnitsInRadius(location: Vector, radius: number): Unit[];

// Use declared API in code
function onSpellStart(event: OnSpellStartEvent): void {
    const units = FindUnitsInRadius(event.targetLocation, 500);
    const enemies = units.filter(unit => event.caster.isEnemy(unit));

    for (const unit of enemies) {
        print(unit, unit.getLevel());
        unit.kill();
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
