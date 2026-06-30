import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import type { HistogramSeries } from "../types/analysis";
import { ShowChartCanvas } from "./ChartCanvas";

type HistogramChartProps = {
  series: HistogramSeries[];
};

/** Build and return a bar chart config for one histogram. */
function buildConfig(series: HistogramSeries): ChartConfiguration {
  return {
    data: {
      datasets: [{ backgroundColor: "#0f172a", data: series.values, label: series.columnName }],
      labels: series.labels,
    },
    options: { maintainAspectRatio: false, responsive: true },
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
    <div className="grid gap-5 lg:grid-cols-2">
      {configs.map((config, index) => (
        <div key={series[index].columnName} className="h-80 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <ShowChartCanvas config={config} />
        </div>
      ))}
    </div>
  );
}
