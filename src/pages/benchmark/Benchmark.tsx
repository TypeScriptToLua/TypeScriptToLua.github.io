import React from "react";
import * as d3 from "d3";

import { join as joinOnProperty } from "./util";

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
const dataCommit: BenchmarkResult[] = [{"categories":{"garbage":5.5390625,"totalMemory":917.02734375},"kind":"memory","benchmarkName":"./memory_benchmarks/class_creation.lua"},{"categories":{"garbage":128.5390625,"totalMemory":129.08203125},"kind":"memory","benchmarkName":"./memory_benchmarks/array_every.lua"},{"categories":{"garbage":3.625,"totalMemory":132.4296875},"kind":"memory","benchmarkName":"./memory_benchmarks/array_push.lua"},{"categories":{"garbage":172572.8359375,"totalMemory":172587.55078125},"kind":"memory","benchmarkName":"./memory_benchmarks/graph_cylce.lua"},{"categories":{"garbage":48287.7734375,"totalMemory":58417.96875},"kind":"memory","benchmarkName":"./memory_benchmarks/array_concat.lua"}];

const matchedBenchmarks = joinOnProperty(dataMaster, dataCommit, bm => bm.benchmarkName);

const formatBenchmarkName = (benchmarkName: string) => benchmarkName.replace(".lua", "").split("/").pop()!;

const generatedGarbageData = matchedBenchmarks.map(bm => ({
    name: formatBenchmarkName(bm.left?.benchmarkName ?? bm.right?.benchmarkName!),
    oldValue: bm.left?.categories[MemoryBenchmarkCategory.Garbage] ?? 0,
    newValue: bm.right?.categories[MemoryBenchmarkCategory.Garbage] ?? 0
}));

const GRAPH_WIDTH = 1000;
const GRAPH_HEIGHT = 300;
const GRAPH_MARGIN = { left: 50, top: 5, right: 1 };

let node: SVGSVGElement | null = null;

export default class extends React.Component {

    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        const barMaxHeight = GRAPH_HEIGHT - 50;

        const xScale = d3.scaleBand()
            .domain(generatedGarbageData.map(bm => bm.name))
            .range([GRAPH_MARGIN.left, GRAPH_WIDTH - GRAPH_MARGIN.right]);

        const bandWidth = xScale.bandwidth();
        const barWidth = 25;

        const xAxis = d3.axisBottom(xScale);

        d3.select(node)
            .append("g")
                .attr("transform", `translate(0, ${barMaxHeight})`)
                .call(xAxis);

        const maxValue = d3.max(generatedGarbageData.map(bm => Math.max(bm.oldValue, bm.newValue)))!;
        const maxAxisValue = Math.pow(10, Math.ceil(Math.log10(maxValue)));

        const yScale = d3.scaleLog()
            .domain([1, maxAxisValue])
            .range([barMaxHeight - GRAPH_MARGIN.top, 0]);

        const yAxis = d3.axisLeft(yScale);

        d3.select(node)
            .append("g")
                .attr("transform", `translate(${GRAPH_MARGIN.left}, ${GRAPH_MARGIN.top})`)
                .call(yAxis);

        const entries = d3.select(node)
            .selectAll('rect')
            .data(generatedGarbageData)
            .enter();

        entries
            .append('rect')
                .attr('width', barWidth)
                .attr('x', d => xScale(d.name)! + 0.5 * bandWidth - barWidth - 1)
                .attr('height', d => barMaxHeight - yScale(d.oldValue))
                .attr('y', d => yScale(d.oldValue))
                .style('fill', 'red');
                //.style("stroke", "currentColor");
        
        entries
            .append('rect')
                .attr('width', barWidth)
                .attr('x', d => xScale(d.name)! + 0.5 * bandWidth + 1)
                .attr('height', d => barMaxHeight - yScale(d.newValue))
                .attr('y', d => yScale(d.newValue))
                .style('fill', 'blue')
                //.style("stroke", "currentColor");

        // Add legend
        const legendEntries = [["Master", "red"], ["Commit", "blue"]];
        const legend = d3.select(node)
            .append("g")
            .attr("transform", `translate(${GRAPH_WIDTH - 100 * legendEntries.length - GRAPH_MARGIN.right}, ${GRAPH_HEIGHT - 20})`);

        legendEntries.forEach(([name, color], i) => {
            legend.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("x", 100 * i)
                .style("fill", color)
                .style("stroke", "currentColor");
            
            legend.append("text")
                .attr("x", 100 * i + 20)
                .attr("y", 13)
                //.attr("width", 80)
                //.attr("height", 20)
                .text(name)
                .attr("fill", "currentColor");
        });
    }

    render() {
        return (
            <>
                <h2>Garbage created</h2>
                <svg ref={n => node = n} width={GRAPH_WIDTH} height={GRAPH_HEIGHT}></svg>
            </>
        );
    }
}
