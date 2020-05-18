import * as d3 from "d3";
import React from "react";
import * as zlib from "zlib";

import { barComparisonGraph } from "./bar-comparison-graph";
import { positiveNegativeBarGraph } from "./positive-negative-bar-graph";
import { joinOnProperty, JoinResult } from "./util";

export enum BenchmarkKind {
    Memory = "memory",
}

export type BenchmarkResult = MemoryBenchmarkResult;

export enum MemoryBenchmarkCategory {
    TotalMemory = "totalMemory",
    Garbage = "garbage",
}

export interface MemoryBenchmarkResult {
    kind: string;
    categories: Record<MemoryBenchmarkCategory, number>;
    benchmarkName: string;
}

// Utility functions
const formatBenchmarkName = (benchmarkName: string) => benchmarkName.replace(".lua", "").split("/").pop()!;
const formatMemory = (value: number) => `${Math.round(value / 10) / 100} Kb`;

const benchmarkGarbage = (bm: BenchmarkResult) => bm.categories[MemoryBenchmarkCategory.Garbage];
const garbagePercentChange = (result: JoinResult<BenchmarkResult>) =>
    (benchmarkGarbage(result.right!) - benchmarkGarbage(result.left!)) / benchmarkGarbage(result.left!);

// Get benchmark data from URL parameter
const data = window.location.search.split("?d=")[1];
const results = JSON.parse(zlib.inflateSync(Buffer.from(data, "base64")).toString());

const dataMaster = results.old as BenchmarkResult[];
const dataCommit = results.new as BenchmarkResult[];

// Match old/new results by name
const matchedBenchmarks = joinOnProperty(dataMaster, dataCommit, (bm) => bm.benchmarkName);

// Sort by percentage change of garbage created
const benchmarksSortedByPercentDifference = matchedBenchmarks.sort(
    (a, b) => garbagePercentChange(a) - garbagePercentChange(b),
);

// Table containing the benchmark results
const resultsTable: JSX.Element[] = [];
benchmarksSortedByPercentDifference.forEach((bm, i) => {
    const change = garbagePercentChange(bm);
    const rowColor = change === 0 ? "currentColor" : change > 0 ? "red" : "green";

    resultsTable.push(
        <tr key={i} style={{ color: rowColor }}>
            <td>{bm.left?.benchmarkName}</td>
            <td>{formatMemory(benchmarkGarbage(bm.left!))}</td>
            <td>{formatMemory(benchmarkGarbage(bm.right!))}</td>
            <td>{change}</td>
        </tr>,
    );
});

// Comparison data master garbage created vs commit garbate created (ABSOLUTE)
const generatedGarbageData = benchmarksSortedByPercentDifference.map((bm) => ({
    name: formatBenchmarkName(bm.left?.benchmarkName ?? bm.right?.benchmarkName!),
    oldValue: bm.left?.categories[MemoryBenchmarkCategory.Garbage] ?? 0,
    newValue: bm.right?.categories[MemoryBenchmarkCategory.Garbage] ?? 0,
}));

let garbageCreatedComparisonSvg: SVGSVGElement;
const garbageCreatedComparisonGraphWidth = 1000;
const garbageCreatedComparisonGraphHeight = 300;

// Comparison data master garbage created vs commit garbate created (ABSOLUTE)
const generatedGarbageChangeData = matchedBenchmarks.map((bm) => {
    const oldValue = bm.left?.categories[MemoryBenchmarkCategory.Garbage]!;
    const newValue = bm.right?.categories[MemoryBenchmarkCategory.Garbage]!;

    return {
        name: formatBenchmarkName(bm.left?.benchmarkName ?? bm.right?.benchmarkName!),
        value: (100 * (newValue - oldValue)) / oldValue,
    };
});

let garbageCreatedChangeSvg: SVGSVGElement;
const garbageCreatedChangeGraphWidth = 1000;
const garbageCreatedChangeGraphHeight = 300;

export default class extends React.Component {
    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        positiveNegativeBarGraph(
            d3.select(garbageCreatedChangeSvg),
            generatedGarbageChangeData,
            garbageCreatedChangeGraphWidth,
            garbageCreatedChangeGraphHeight,
        );

        barComparisonGraph(
            d3.select(garbageCreatedComparisonSvg),
            generatedGarbageData,
            garbageCreatedComparisonGraphWidth,
            garbageCreatedComparisonGraphHeight,
        );
    }

    render() {
        return (
            <>
                {/* Results table */}
                <h2>Benchmark results</h2>
                <table>
                    <thead>
                        <tr style={{ fontWeight: "bold" }}>
                            <td>Benchmark</td>
                            <td>Garbage Master</td>
                            <td>Garbage Commit</td>
                            <td>% Change</td>
                        </tr>
                    </thead>
                    <tbody>{resultsTable}</tbody>
                </table>

                <h2>Garbage created change</h2>
                {/* [% Delta] Gerbage created */}
                <svg
                    ref={(n) => (garbageCreatedChangeSvg = n!)}
                    width={garbageCreatedChangeGraphWidth}
                    height={garbageCreatedChangeGraphHeight}
                ></svg>

                <h2>Garbage created</h2>
                {/* [Absolute] Garbage created comparison */}
                <svg
                    ref={(n) => (garbageCreatedComparisonSvg = n!)}
                    width={garbageCreatedComparisonGraphWidth}
                    height={garbageCreatedComparisonGraphHeight}
                ></svg>
            </>
        );
    }
}
