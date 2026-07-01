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
      datasets: [{ backgroundColor: "#f97316", data: series.values, label: "Missing values" }],
      labels: series.labels,
    },
    options: { maintainAspectRatio: false, responsive: true },
    type: "bar",
  };
}

/** Show and return the missing values bar chart. */
export function ShowMissingValuesChart({ series }: MissingValuesChartProps) {
  const config = useMemo(() => buildConfig(series), [series]);

  return (
    <div className="h-96 min-w-[760px] rounded-lg border border-orange-100 bg-orange-50/40 p-4 dark:border-slate-800 dark:bg-slate-950">
      <ShowChartCanvas config={config} />
    </div>
  );
}
