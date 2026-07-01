import type { AnalysisResult } from "../types/analysis";
import { ShowKpiCard } from "./KpiCard";

type DashboardKpisProps = {
  analysisResult: AnalysisResult;
};

/** Format and return a percent label. */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Show and return dashboard KPI cards. */
export function ShowDashboardKpis({ analysisResult }: DashboardKpisProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ShowKpiCard label="Rows" tone="blue" value={analysisResult.rowCount.toLocaleString()} />
      <ShowKpiCard label="Columns" tone="emerald" value={analysisResult.columnCount.toLocaleString()} />
      <ShowKpiCard label="Nulls overall" tone="orange" value={formatPercent(analysisResult.nullPercent)} />
      <ShowKpiCard label="Duplicate rows" tone="violet" value={formatPercent(analysisResult.duplicateRowPercent)} />
    </section>
  );
}
