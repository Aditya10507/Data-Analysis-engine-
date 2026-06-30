import { useMemo } from "react";
import type { ChartConfiguration } from "chart.js";
import type { TrendSeries } from "../types/analysis";
import { ShowChartCanvas } from "./ChartCanvas";

type TrendLineChartProps = {
  series: TrendSeries[];
};

/** Build and return a line chart config for numeric trends. */
function buildConfig(series: TrendSeries[]): ChartConfiguration {
  return {
    data: {
      datasets: series.map((item) => ({
        borderColor: "#0f172a",
        data: item.points,
        label: item.columnName,
        tension: 0.25,
      })),
    },
    options: { maintainAspectRatio: false, parsing: false, responsive: true },
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
    <div className="h-96 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <ShowChartCanvas config={config} />
    </div>
  );
}
