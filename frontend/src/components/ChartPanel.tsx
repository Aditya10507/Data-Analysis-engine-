import { useState } from "react";
import type { AnalysisResult } from "../types/analysis";
import { ShowCorrelationHeatmap } from "./CorrelationHeatmap";
import { ShowHistogramChart } from "./HistogramChart";
import { ShowMissingValuesChart } from "./MissingValuesChart";
import { ShowTrendLineChart } from "./TrendLineChart";

type ChartTab = "distribution" | "correlation" | "trends" | "missing";

type ChartPanelProps = {
  analysisResult: AnalysisResult;
};

const CHART_TABS: { label: string; value: ChartTab }[] = [
  { label: "Distribution", value: "distribution" },
  { label: "Correlation", value: "correlation" },
  { label: "Trends", value: "trends" },
  { label: "Missing values", value: "missing" },
];

/** Build and return a tab button class name. */
function buildTabClass(isActive: boolean): string {
  const baseClass = "rounded-md px-3 py-2 text-left text-sm font-medium";
  return isActive ? `${baseClass} bg-slate-950 text-white` : `${baseClass} text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`;
}

/** Show and return the selected chart tab content. */
function renderChart(activeTab: ChartTab, analysisResult: AnalysisResult) {
  if (activeTab === "correlation") {
    return <ShowCorrelationHeatmap cells={analysisResult.correlationCells} />;
  }

  if (activeTab === "trends") {
    return <ShowTrendLineChart series={analysisResult.trendSeries} />;
  }

  if (activeTab === "missing") {
    return <ShowMissingValuesChart series={analysisResult.missingValueSeries} />;
  }

  return <ShowHistogramChart series={analysisResult.histogramSeries} />;
}

/** Show and return the responsive dashboard chart panel. */
export function ShowChartPanel({ analysisResult }: ChartPanelProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("distribution");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row">
        {CHART_TABS.map((tab) => (
          <button
            key={tab.value}
            className={buildTabClass(activeTab === tab.value)}
            type="button"
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-5">{renderChart(activeTab, analysisResult)}</div>
    </section>
  );
}
