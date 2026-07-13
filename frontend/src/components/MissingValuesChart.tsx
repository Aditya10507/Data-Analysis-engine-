import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import type { MissingValueSeries } from "../types/analysis";
import { ShowChartCanvas } from "./ChartCanvas";

type MissingValuesChartProps = {
  series: MissingValueSeries;
};

/** Build and return a bar chart config for missing values. */
function buildConfig(series: MissingValueSeries): ChartConfiguration {
  return {
    data: {
      datasets: [{ backgroundColor: "#f59e0bCC", borderColor: "#d97706", borderRadius: 5, borderWidth: 1, data: series.values, label: "Missing values" }],
      labels: series.labels,
    },
    options: { indexAxis: "y", interaction: { intersect: false, mode: "index" }, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { displayColors: false } }, responsive: true, scales: { x: { beginAtZero: true, grid: { color: "#e2e8f0" }, title: { display: true, text: "Missing cells" } }, y: { grid: { display: false } } } },
    type: "bar",
  };
}

/** Show and return the missing values bar chart. */
export function ShowMissingValuesChart({ series }: MissingValuesChartProps) {
  const config = useMemo(() => buildConfig(series), [series]);

  return (
    <div className="h-[460px] min-w-[760px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <ShowChartCanvas config={config} />
    </div>
  );
}
