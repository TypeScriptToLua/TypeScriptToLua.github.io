import { Buffer } from "buffer/";
import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import * as zlib from "zlib";
import {
    BenchmarkKind,
    BenchmarkResult,
    isMemoryBenchmarkResult,
    isRuntimeBenchmarkResult,
    MemoryBenchmarkCategory,
    MemoryBenchmarkResult,
    RuntimeBenchmarkResult,
} from "./benchmark-types";
import { joinOnProperty, JoinResult } from "./util";
import { barComparisonGraph } from "./visualizations/bar-comparison-graph";
import { positiveNegativeBarGraph } from "./visualizations/positive-negative-bar-graph";

const comparisonGraphWidth = 1000;
const comparisonGraphHeight = 300;

const changeGraphWidth = 1000;
const changeGraphHeight = 300;

// Utility functions
const formatBenchmarkName = (benchmarkName: string) => benchmarkName.replace(".lua", "").split("/").pop()!;
const percentChange = (oldValue: number, newValue: number) => ((newValue - oldValue) / oldValue) * 100;
const formatMemory = (value: number) => `${(value / 1000).toFixed(2)} Mb`;
const formatTime = (value: number) => `${(value * 1000).toFixed(2)} ms`;
const formatPercent = (value: number) => `${value.toFixed(2)}%`;

function BenchmarkCategory<T extends BenchmarkResult>({
    name,
    benchmarks,
    extractValue,
    formatValue,
}: {
    name: string;
    benchmarks: JoinResult<T>[];
    extractValue: (result: T) => number;
    formatValue: (value: number) => string;
}) {
    let changeSvgRef = useRef<SVGSVGElement>(null!);
    let comparisonSvgRef = useRef<SVGSVGElement>(null!);

    const percentChangeForResult = (result: JoinResult<T>) =>
        percentChange(extractValue(result.left!), extractValue(result.right!));

    // Sort by percentage change
    const benchmarksSortedByPercentageDiff = benchmarks.sort(
        (a, b) => percentChangeForResult(a) - percentChangeForResult(b),
    );

    // Populate graph with benchmark results
    const memoryBenchmarksResultTable = benchmarksSortedByPercentageDiff.map((bm, i) => {
        const change = percentChangeForResult(bm);
        const rowColor = change === 0 ? "currentColor" : change > 0 ? "red" : "green";

        return (
            <tr key={i} style={{ color: rowColor }}>
                <td>{bm.left!.benchmarkName}</td>
                <td>{formatValue(extractValue(bm.left!))}</td>
                <td>{formatValue(extractValue(bm.right!))}</td>
                <td>{formatPercent(change)}</td>
            </tr>
        );
    });

    // Comparison data master vs commit (PERCENTAGE CHANGE)
    const changeData = benchmarksSortedByPercentageDiff.map((bm) => ({
        name: formatBenchmarkName(bm.left!.benchmarkName || bm.right!.benchmarkName!),
        value: percentChangeForResult(bm),
    }));

    // Comparison data master vs commit (ABSOLUTE)
    const absoluteData = benchmarksSortedByPercentageDiff.map((bm) => ({
        name: formatBenchmarkName(bm.left!.benchmarkName || bm.right!.benchmarkName!),
        oldValue: extractValue(bm.left!) || 0,
        newValue: extractValue(bm.right!) || 0,
    }));

    useEffect(() => {
        // Populate graph showing percent change
        positiveNegativeBarGraph(d3.select(changeSvgRef.current), changeData, changeGraphWidth, changeGraphHeight);

        // Populate graph showing absolute numbers
        barComparisonGraph(
            d3.select(comparisonSvgRef.current),
            absoluteData,
            comparisonGraphWidth,
            comparisonGraphHeight,
        );
    });

    return (
        <>
            <h1>{name} results</h1>
            {/* Results table */}
            <table>
                <thead>
                    <tr style={{ fontWeight: "bold" }}>
                        <td>Benchmark</td>
                        <td>Master</td>
                        <td>Commit</td>
                        <td>% Change</td>
                    </tr>
                </thead>
                <tbody>{memoryBenchmarksResultTable}</tbody>
            </table>

            <h2>{name} change</h2>
            {/* [% Delta] */}
            <svg ref={changeSvgRef} width={changeGraphWidth} height={changeGraphHeight} />

            <h2>{name}</h2>
            {/* [Absolute] comparison */}
            <svg ref={comparisonSvgRef} width={comparisonGraphWidth} height={comparisonGraphHeight} />
        </>
    );
}

export default function Benchmark() {
    const benchmarkData = decodeBenchmarkData(window.location.search.split("?d=")[1]);
    return (
        <>
            {/* Results table */}
            <BenchmarkCategory
                name={"Garbage created"}
                benchmarks={benchmarkData.memory}
                extractValue={(bm) => bm.categories[MemoryBenchmarkCategory.Garbage]}
                formatValue={formatMemory}
            />

            <BenchmarkCategory
                name={"Runtime"}
                benchmarks={benchmarkData.runtime}
                extractValue={(bm) => bm.time}
                formatValue={formatTime}
            />
        </>
    );
}

interface BenchmarkData {
    [BenchmarkKind.Memory]: JoinResult<MemoryBenchmarkResult>[];
    [BenchmarkKind.Runtime]: JoinResult<RuntimeBenchmarkResult>[];
}

function isMemoryBenchmarkJoinResult(r: JoinResult<BenchmarkResult>): r is JoinResult<MemoryBenchmarkResult> {
    return isMemoryBenchmarkResult(r.left || r.right!);
}

function isRuntimeBenchmarkJoinResult(r: JoinResult<BenchmarkResult>): r is JoinResult<RuntimeBenchmarkResult> {
    return isRuntimeBenchmarkResult(r.left || r.right!);
}

function decodeBenchmarkData(encodedData: string): BenchmarkData {
    const results = JSON.parse(zlib.inflateSync(Buffer.from(encodedData, "base64")).toString());

    const dataMaster = results.old as BenchmarkResult[];
    const dataCommit = results.new as BenchmarkResult[];

    // Match old/new results by name
    const joined = joinOnProperty(dataMaster, dataCommit, (bm) => bm.benchmarkName);
    return {
        [BenchmarkKind.Memory]: joined.filter(isMemoryBenchmarkJoinResult),
        [BenchmarkKind.Runtime]: joined.filter(isRuntimeBenchmarkJoinResult),
    };
}
