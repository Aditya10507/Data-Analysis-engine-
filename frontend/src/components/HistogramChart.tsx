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
  return {
    data: {
      datasets: [{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length], data: series.values, label: series.columnName }],
      labels: series.labels,
    },
    options: { maintainAspectRatio: false, responsive: true, scales: { y: { beginAtZero: true } } },
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
        <div key={series[index].columnName} className="h-80 rounded-lg border border-blue-100 bg-blue-50/40 p-4 dark:border-slate-800 dark:bg-slate-950">
          <ShowChartCanvas config={config} />
        </div>
      ))}
    </div>
  );
}
