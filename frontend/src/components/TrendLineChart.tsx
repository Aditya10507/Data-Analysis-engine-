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
        borderColor: LINE_COLORS[index % LINE_COLORS.length],
        data: item.points,
        label: item.columnName,
        tension: 0.25,
      })),
    },
    options: { maintainAspectRatio: false, parsing: false, responsive: true, scales: { y: { beginAtZero: false } } },
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
    <div className="h-96 min-w-[820px] rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 dark:border-slate-800 dark:bg-slate-950">
      <ShowChartCanvas config={config} />
    </div>
  );
}
