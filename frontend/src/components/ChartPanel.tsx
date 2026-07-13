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
  initialChartMode?: ChartMode;
  jobId: string | null;
  onActiveTabChange: (activeTab: ChartTab) => void;
  onSelectedColumnChange: (columnName: string | null) => void;
  selectedColumn: string | null;
};

const CHART_TABS: { description: string; label: string; value: ChartTab }[] = [
  { description: "Understand concentration, spread, and unusual values.", label: "Distribution", value: "distribution" },
  { description: "Compare the strength and direction of numeric relationships.", label: "Correlation", value: "correlation" },
  { description: "Explore how numeric measures move across row order.", label: "Trends", value: "trends" },
  { description: "Identify incomplete fields that may affect decisions.", label: "Missing values", value: "missing" },
];

/** Show and return the responsive dashboard chart panel. */
export function ShowChartPanel(props: ChartPanelProps) {
  const initialChartMode = props.initialChartMode ?? "2d";
  const [chartMode, setChartMode] = useState<ChartMode>(initialChartMode);
  const [isThreeDimensionalMounted, setIsThreeDimensionalMounted] = useState(initialChartMode === "3d");
  const { activeTab, analysisResult, jobId, onActiveTabChange, onSelectedColumnChange, selectedColumn } = props;
  const activeLabel = CHART_TABS.find((tab) => tab.value === activeTab)?.label ?? "chart";
  const activeDescription = CHART_TABS.find((tab) => tab.value === activeTab)?.description ?? "Explore report data.";
  const selectableColumns = buildSelectableColumns(analysisResult, activeTab);

  useEffect(() => {
    const timeoutId = window.setTimeout(preloadPlotly, 800);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <ShowChartPanelHeader activeDescription={activeDescription} activeLabel={activeLabel} activeTab={activeTab} chartMode={chartMode} columns={selectableColumns} onActiveTabChange={onActiveTabChange} onChartModeChange={(nextMode) => handleChartModeChange(nextMode, setChartMode, setIsThreeDimensionalMounted)} onSelectedColumnChange={onSelectedColumnChange} selectedColumn={selectedColumn} />
      <div className="bg-slate-50/70 p-5 dark:bg-slate-950/40">
        <ShowChartAiActions chartLabel={activeLabel} jobId={jobId} />
      </div>
      <div className="max-h-[760px] overflow-x-auto overflow-y-auto p-5">
        {renderChartOutput(chartMode, activeTab, analysisResult, selectedColumn, isThreeDimensionalMounted)}
      </div>
    </section>
  );
}

/** Show and return chart navigation, mode, and column controls. */
function ShowChartPanelHeader(props: { activeDescription: string; activeLabel: string; activeTab: ChartTab; chartMode: ChartMode; columns: string[]; onActiveTabChange: (tab: ChartTab) => void; onChartModeChange: (mode: ChartMode) => void; onSelectedColumnChange: (column: string | null) => void; selectedColumn: string | null }) {
  return <div className="border-b border-slate-100 p-5 dark:border-slate-800"><div className="mb-5"><p className="text-sm font-semibold text-blue-600">VISUAL EXPLORER</p><h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{props.activeLabel}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{props.activeDescription}</p></div><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><ShowChartTabs activeTab={props.activeTab} onActiveTabChange={props.onActiveTabChange} /><ShowChartModeToggle chartMode={props.chartMode} onChartModeChange={props.onChartModeChange} /></div><ShowChartColumnControls columns={props.columns} onChange={props.onSelectedColumnChange} selectedColumn={props.selectedColumn} /></div>;
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
          <ShowPlotly3DChart activeTab={activeTab} analysisResult={analysisResult} isVisible={chartMode === "3d"} selectedColumn={selectedColumn} />
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
