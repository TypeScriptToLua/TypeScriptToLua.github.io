import React from "react";
import { SmallCallout } from "../SmallCallout";

export function DeprecatedInVersion({ deprecated, removed }: { deprecated: string; removed: string }) {
    return (
        <p
            style={{
                fontWeight: "bold",
            }}
        >
            <SmallCallout severity="warning">Deprecated:</SmallCallout>
            <a href={"https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/CHANGELOG.md#" + deprecated}>
                {deprecated}
            </a>{" "}
            <SmallCallout severity="danger">Removed:</SmallCallout>
            <a href={"https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/CHANGELOG.md#" + removed}>
                {removed}
            </a>
        </p>
    );
}
