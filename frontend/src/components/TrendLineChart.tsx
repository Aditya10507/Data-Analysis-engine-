import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import type { TrendSeries } from "../types/analysis";
import { ShowChartCanvas } from "./ChartCanvas";

type TrendLineChartProps = {
  series: TrendSeries[];
};

const LINE_COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626"];

/** Build and return a line chart config for numeric trends. */
function buildConfig(series: TrendSeries[]): ChartConfiguration {
  return {
    data: {
      datasets: series.map((item, index) => ({
        backgroundColor: `${LINE_COLORS[index % LINE_COLORS.length]}12`,
        borderColor: LINE_COLORS[index % LINE_COLORS.length],
        borderWidth: 2,
        data: item.points,
        fill: series.length === 1,
        label: item.columnName,
        pointHoverRadius: 5,
        pointRadius: 0,
        tension: 0.35,
      })),
    },
    options: { interaction: { intersect: false, mode: "index" }, maintainAspectRatio: false, parsing: false, plugins: { legend: { labels: { usePointStyle: true } } }, responsive: true, scales: { x: { grid: { display: false }, title: { display: true, text: "Row index" } }, y: { beginAtZero: false, grid: { color: "#e2e8f0" } } } },
    type: "line",
  };
}

/** Show and return numeric trend lines over row index. */
export function ShowTrendLineChart({ series }: TrendLineChartProps) {
  const config = useMemo(() => buildConfig(series), [series]);

  if (!series.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No numeric trends available.</p>;
  }

  return (
    <div className="h-[460px] min-w-[820px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <ShowChartCanvas config={config} />
    </div>
  );
}
