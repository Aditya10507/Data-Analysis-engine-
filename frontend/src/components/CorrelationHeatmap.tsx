import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import type { CorrelationCell } from "../types/analysis";

const CELL_SIZE = 72;
const LABEL_OFFSET = 156;
const LABEL_MAX_LENGTH = 16;
const SVG_PADDING = 32;

type CorrelationHeatmapProps = {
  cells: CorrelationCell[];
};

/** Return unique heatmap labels from cells. */
function buildLabels(cells: CorrelationCell[]): string[] {
  return Array.from(new Set(cells.flatMap((cell) => [cell.xColumn, cell.yColumn])));
}

/** Render D3 heatmap cells into an SVG element. */
function renderHeatmap(svgElement: SVGSVGElement, cells: CorrelationCell[], labels: string[]): void {
  const width = LABEL_OFFSET + labels.length * CELL_SIZE + SVG_PADDING;
  const height = LABEL_OFFSET + labels.length * CELL_SIZE + SVG_PADDING;
  const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();
  svg.attr("height", height).attr("viewBox", `0 0 ${width} ${height}`).attr("width", width);
  const rectangles = svg.selectAll("rect").data(cells).join("rect")
    .attr("x", (cell) => LABEL_OFFSET + labels.indexOf(cell.xColumn) * CELL_SIZE)
    .attr("y", (cell) => LABEL_OFFSET + labels.indexOf(cell.yColumn) * CELL_SIZE)
    .attr("width", CELL_SIZE).attr("height", CELL_SIZE)
    .attr("fill", (cell) => colorScale(cell.value)).attr("rx", 3);
  rectangles.append("title").text((cell) => `${cell.xColumn} and ${cell.yColumn}: ${cell.value.toFixed(3)}`);
  svg.selectAll(".x-label").data(labels).join("text")
    .attr("x", (_, index) => LABEL_OFFSET + index * CELL_SIZE + CELL_SIZE / 2)
    .attr("y", LABEL_OFFSET - 18)
    .attr("text-anchor", "end")
    .attr("transform", (_, index) => `rotate(-45 ${LABEL_OFFSET + index * CELL_SIZE + CELL_SIZE / 2} ${LABEL_OFFSET - 18})`)
    .text((label) => truncateLabel(label));
  svg.selectAll(".y-label").data(labels).join("text")
    .attr("x", LABEL_OFFSET - 12).attr("y", (_, index) => LABEL_OFFSET + index * CELL_SIZE + CELL_SIZE / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end").text((label) => truncateLabel(label));
}

/** Truncate and return a readable heatmap label. */
function truncateLabel(label: string): string {
  return label.length > LABEL_MAX_LENGTH ? `${label.slice(0, LABEL_MAX_LENGTH)}...` : label;
}

/** Show and return a D3 correlation heatmap. */
export function ShowCorrelationHeatmap({ cells }: CorrelationHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const labels = useMemo(() => buildLabels(cells), [cells]);

  useEffect(() => {
    if (svgRef.current && cells.length) {
      renderHeatmap(svgRef.current, cells, labels);
    }
  }, [cells, labels]);

  if (!cells.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No numeric correlations available.</p>;
  }

  return (
    <div className="max-h-[620px] overflow-x-auto overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <svg ref={svgRef} className="text-xs text-slate-600 dark:text-slate-300" />
    </div>
  );
}
