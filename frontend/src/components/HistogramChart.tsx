import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import type { HistogramSeries } from "../types/analysis";
import { ShowChartCanvas } from "./ChartCanvas";

type HistogramChartProps = {
  series: HistogramSeries[];
};

const CHART_COLORS = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626"];

/** Build and return a bar chart config for one histogram. */
function buildConfig(series: HistogramSeries, index: number): ChartConfiguration {
  const color = CHART_COLORS[index % CHART_COLORS.length];
  return {
    data: {
      datasets: [{ backgroundColor: `${color}CC`, borderColor: color, borderRadius: 5, borderWidth: 1, data: series.values, label: series.columnName }],
      labels: series.labels,
    },
    options: { interaction: { intersect: false, mode: "index" }, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { displayColors: false } }, responsive: true, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } }, y: { beginAtZero: true, grid: { color: "#e2e8f0" } } } },
    type: "bar",
  };
}

/** Show and return histogram charts for numeric columns. */
export function ShowHistogramChart({ series }: HistogramChartProps) {
  const configs = useMemo(() => series.map(buildConfig), [series]);

  if (!series.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No numeric columns found.</p>;
  }

  return (
    <div className="grid min-w-[760px] gap-5 lg:grid-cols-2">
      {configs.map((config, index) => (
        <article key={series[index].columnName} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="font-semibold text-slate-950 dark:text-white">{series[index].columnName}</h3><p className="mt-1 text-xs text-slate-500">Frequency by value range</p><div className="mt-4 h-72"><ShowChartCanvas config={config} /></div>
        </article>
      ))}
    </div>
  );
}
