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
      <ShowKpiCard label="Rows" value={analysisResult.rowCount.toLocaleString()} />
      <ShowKpiCard label="Columns" value={analysisResult.columnCount.toLocaleString()} />
      <ShowKpiCard label="Nulls overall" value={formatPercent(analysisResult.nullPercent)} />
      <ShowKpiCard label="Duplicate rows" value={formatPercent(analysisResult.duplicateRowPercent)} />
    </section>
  );
}
