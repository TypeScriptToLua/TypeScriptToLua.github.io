import * as d3 from "d3";

export function addLegend(
    selection: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    items: Array<[string, string]>,
) {
    const legend = selection.append("g");

    items.forEach(([name, color], i) => {
        legend
            .append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("x", 100 * i)
            .style("fill", color)
            .style("stroke", "currentColor");

        legend
            .append("text")
            .attr("x", 100 * i + 20)
            .attr("y", 13)
            .text(name)
            .attr("fill", "currentColor");
    });

    return legend;
}
