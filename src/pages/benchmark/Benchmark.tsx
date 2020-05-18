import React from "react";
import * as d3 from "d3";

import { join as joinOnProperty } from "./util";
import { barComparisonGraph } from './bar-comparison-graph';
import { positiveNegativeBarGraph } from './positive-negative-bar-graph';

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

const dataMaster: BenchmarkResult[] = [{"benchmarkName":"./memory_benchmarks/class_creation.lua","categories":{"garbage":8.5390625,"totalMemory":917.02734375},"kind":"memory"},{"benchmarkName":"./memory_benchmarks/array_every.lua","categories":{"garbage":128.5390625,"totalMemory":129.08203125},"kind":"memory"},{"benchmarkName":"./memory_benchmarks/array_push.lua","categories":{"garbage":4.625,"totalMemory":132.4296875},"kind":"memory"},{"benchmarkName":"./memory_benchmarks/graph_cylce.lua","categories":{"garbage":172575.6484375,"totalMemory":172590.37109375},"kind":"memory"},{"benchmarkName":"./memory_benchmarks/array_concat.lua","categories":{"garbage":58287.7734375,"totalMemory":58417.96875},"kind":"memory"}];
const dataCommit: BenchmarkResult[] = [{"categories":{"garbage":5.5390625,"totalMemory":917.02734375},"kind":"memory","benchmarkName":"./memory_benchmarks/class_creation.lua"},{"categories":{"garbage":168.5390625,"totalMemory":129.08203125},"kind":"memory","benchmarkName":"./memory_benchmarks/array_every.lua"},{"categories":{"garbage":3.625,"totalMemory":132.4296875},"kind":"memory","benchmarkName":"./memory_benchmarks/array_push.lua"},{"categories":{"garbage":172572.8359375,"totalMemory":172587.55078125},"kind":"memory","benchmarkName":"./memory_benchmarks/graph_cylce.lua"},{"categories":{"garbage":48287.7734375,"totalMemory":58417.96875},"kind":"memory","benchmarkName":"./memory_benchmarks/array_concat.lua"}];

const matchedBenchmarks = joinOnProperty(dataMaster, dataCommit, bm => bm.benchmarkName);

const formatBenchmarkName = (benchmarkName: string) => benchmarkName.replace(".lua", "").split("/").pop()!;

// Comparison data master garbage created vs commit garbate created (ABSOLUTE)
const generatedGarbageData = matchedBenchmarks.map(bm => ({
    name: formatBenchmarkName(bm.left?.benchmarkName ?? bm.right?.benchmarkName!),
    oldValue: bm.left?.categories[MemoryBenchmarkCategory.Garbage] ?? 0,
    newValue: bm.right?.categories[MemoryBenchmarkCategory.Garbage] ?? 0
}));


let garbageCreatedComparisonSvg: SVGSVGElement;
const garbageCreatedComparisonGraphWidth = 1000;
const garbageCreatedComparisonGraphHeight = 300;

// Comparison data master garbage created vs commit garbate created (ABSOLUTE)
const generatedGarbageChangeData = matchedBenchmarks.map(bm => {
    const oldValue = bm.left?.categories[MemoryBenchmarkCategory.Garbage]!;
    const newValue = bm.right?.categories[MemoryBenchmarkCategory.Garbage]!;
    
    return {
        name: formatBenchmarkName(bm.left?.benchmarkName ?? bm.right?.benchmarkName!),
        value: 100 * (newValue - oldValue) / oldValue
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
            generatedGarbageChangeData.sort((a, b) => a.value - b.value),
            garbageCreatedChangeGraphWidth,
            garbageCreatedChangeGraphHeight
        );

        barComparisonGraph(
            d3.select(garbageCreatedComparisonSvg),
            generatedGarbageData, 
            garbageCreatedComparisonGraphWidth, 
            garbageCreatedComparisonGraphHeight
        );
    }

    render() {
        return (
            <>
                <h2>Garbage created change</h2>
                {/* [% Delta] Gerbage created */}
                <svg ref={n => garbageCreatedChangeSvg = n!}
                    width={garbageCreatedChangeGraphWidth}
                    height={garbageCreatedChangeGraphHeight}>
                </svg>
                <h2>Garbage created</h2>
                {/* [Absolute] Garbage created comparison */}
                <svg ref={n => garbageCreatedComparisonSvg = n!}
                    width={garbageCreatedComparisonGraphWidth}
                    height={garbageCreatedComparisonGraphHeight}>
                </svg>
            </>
        );
    }
}
