import * as d3 from "d3";

interface CategoryData {
    name: string;
    value: number;
}

const GRAPH_MARGIN = { left: 50, top: 5, right: 1 };

export function positiveNegativeBarGraph(
    selection: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: CategoryData[],
    width: number,
    height: number,
) {
    const minValue = d3.min(data.map((bm) => bm.value))!;
    const maxValue = d3.max(data.map((bm) => bm.value))!;

    const range = maxValue - minValue;

    const yScale = d3
        .scaleLinear()
        .domain([minValue - 0.2 * range, maxValue + 0.2 * range])
        .range([0, height - 10]);

    const yAxis = d3.axisLeft(yScale);

    const xScale = d3
        .scaleBand()
        .domain(data.map((bm) => bm.name))
        .range([GRAPH_MARGIN.left, width - GRAPH_MARGIN.right]);

    const bandWidth = xScale.bandwidth();
    const barWidth = Math.min(25, (0.5 * width) / data.length);

    const xAxis = d3.axisBottom(xScale);

    selection
        .append("g")
        .attr("transform", `translate(0, ${yScale(0)! + 5})`)
        .call(xAxis);

    selection.append("g").attr("transform", `translate(${GRAPH_MARGIN.left}, ${GRAPH_MARGIN.top})`).call(yAxis);

    const barSize = (val: number) => Math.abs(yScale(0)! - yScale(val)!);

    const bars = selection.selectAll("rect").data(data).enter();

    bars.append("rect")
        .attr("width", barWidth)
        .attr("x", (d) => xScale(d.name)! + 0.5 * bandWidth - 0.5 * barWidth)
        .attr("height", (d) => barSize(d.value))
        .attr("y", (d) => GRAPH_MARGIN.top + (d.value > 0 ? yScale(0)! : yScale(0)! - barSize(d.value)))
        .style("fill", (d) => (d.value > 0 ? "red" : "green"))
        .style("stroke", "currentColor")
        // Add hover tooltip
        .append("svg:title")
        .text((d) => `${d.name}: ${d.value.toFixed(2)}%`);

    bars.append("text")
        .text((d) => `${d.value > 0 ? "+" : ""}${d.value.toFixed(2)}%`)
        .attr("x", (d) => xScale(d.name)! + 0.5 * bandWidth)
        .attr("y", (d) => (d.value > 0 ? Math.max(yScale(0)! + 40, yScale(d.value)! + 20) : yScale(d.value)!))
        .style("fill", "currentColor")
        .style("text-anchor", "middle");

    return selection;
}
