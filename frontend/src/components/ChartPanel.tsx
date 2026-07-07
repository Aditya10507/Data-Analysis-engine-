import { startTransition, useEffect, useState } from "react";
import type { AnalysisResult } from "../types/analysis";
import { buildSelectableColumns, filterCorrelationCells, filterHistogramSeries, filterMissingSeries, filterTrendSeries } from "../utils/chartFilters";
import { preloadPlotly } from "../utils/plotlyLoader";
import { ShowChartAiActions } from "./ChartAiActions";
import { ShowChartColumnControls } from "./ChartColumnControls";
import { ShowChartModeToggle } from "./ChartModeToggle";
import { ShowCorrelationHeatmap } from "./CorrelationHeatmap";
import { ShowHistogramChart } from "./HistogramChart";
import { ShowMissingValuesChart } from "./MissingValuesChart";
import { ShowPlotly3DChart } from "./Plotly3DChart";
import { ShowTrendLineChart } from "./TrendLineChart";

export type ChartTab = "distribution" | "correlation" | "trends" | "missing";
export type ChartMode = "2d" | "3d";

type ChartPanelProps = {
  activeTab: ChartTab;
  analysisResult: AnalysisResult;
  jobId: string | null;
  onActiveTabChange: (activeTab: ChartTab) => void;
  onSelectedColumnChange: (columnName: string | null) => void;
  selectedColumn: string | null;
};

const CHART_TABS: { label: string; value: ChartTab }[] = [
  { label: "Distribution", value: "distribution" },
  { label: "Correlation", value: "correlation" },
  { label: "Trends", value: "trends" },
  { label: "Missing values", value: "missing" },
];

/** Show and return the responsive dashboard chart panel. */
export function ShowChartPanel(props: ChartPanelProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("2d");
  const [isThreeDimensionalMounted, setIsThreeDimensionalMounted] = useState(false);
  const { activeTab, analysisResult, jobId, onActiveTabChange, onSelectedColumnChange, selectedColumn } = props;
  const activeLabel = CHART_TABS.find((tab) => tab.value === activeTab)?.label ?? "chart";
  const selectableColumns = buildSelectableColumns(analysisResult, activeTab);

  useEffect(() => {
    const timeoutId = window.setTimeout(preloadPlotly, 800);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <ShowChartTabs activeTab={activeTab} onActiveTabChange={onActiveTabChange} />
      <div className="mt-5">
        <ShowChartAiActions chartLabel={activeLabel} jobId={jobId} />
      </div>
      <ShowChartModeToggle chartMode={chartMode} onChartModeChange={(nextMode) => handleChartModeChange(nextMode, setChartMode, setIsThreeDimensionalMounted)} />
      <ShowChartColumnControls columns={selectableColumns} onChange={onSelectedColumnChange} selectedColumn={selectedColumn} />
      <div className="mt-5 max-h-[720px] overflow-auto pr-2">
        {renderChartOutput(chartMode, activeTab, analysisResult, selectedColumn, isThreeDimensionalMounted)}
      </div>
    </section>
  );
}

/** Update the chart mode smoothly and return no content. */
function handleChartModeChange(nextMode: ChartMode, setChartMode: (chartMode: ChartMode) => void, setIsThreeDimensionalMounted: (isMounted: boolean) => void): void {
  startTransition(() => {
    setChartMode(nextMode);
    if (nextMode === "3d") {
      setIsThreeDimensionalMounted(true);
    }
  });
}

/** Show and return chart tab buttons. */
function ShowChartTabs(props: { activeTab: ChartTab; onActiveTabChange: (activeTab: ChartTab) => void }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {CHART_TABS.map((tab) => (
        <button key={tab.value} className={buildTabClass(props.activeTab === tab.value)} type="button" onClick={() => props.onActiveTabChange(tab.value)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Show and return the selected chart output. */
function renderChartOutput(chartMode: ChartMode, activeTab: ChartTab, analysisResult: AnalysisResult, selectedColumn: string | null, isThreeDimensionalMounted: boolean) {
  return (
    <>
      <div className={chartMode === "2d" ? "block" : "hidden"}>{renderChart(activeTab, analysisResult, selectedColumn)}</div>
      {isThreeDimensionalMounted ? (
        <div className={chartMode === "3d" ? "block" : "hidden"}>
          <ShowPlotly3DChart activeTab={activeTab} analysisResult={analysisResult} selectedColumn={selectedColumn} />
        </div>
      ) : null}
    </>
  );
}

/** Show and return the selected 2D chart content. */
function renderChart(activeTab: ChartTab, analysisResult: AnalysisResult, selectedColumn: string | null) {
  if (activeTab === "correlation") {
    return <ShowCorrelationHeatmap cells={filterCorrelationCells(analysisResult.correlationCells, selectedColumn)} />;
  }

  if (activeTab === "trends") {
    return <ShowTrendLineChart series={filterTrendSeries(analysisResult.trendSeries, selectedColumn)} />;
  }

  if (activeTab === "missing") {
    return <ShowMissingValuesChart series={filterMissingSeries(analysisResult, selectedColumn)} />;
  }

  return <ShowHistogramChart series={filterHistogramSeries(analysisResult.histogramSeries, selectedColumn)} />;
}

/** Build and return a tab button class name. */
function buildTabClass(isActive: boolean): string {
  const baseClass = "rounded-md px-3 py-2 text-left text-sm font-medium";
  return isActive ? `${baseClass} bg-blue-600 text-white` : `${baseClass} text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800`;
}
