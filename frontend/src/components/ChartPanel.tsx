import type { AnalysisResult, CorrelationCell, HistogramSeries, TrendSeries } from "../types/analysis";
import { ShowChartAiActions } from "./ChartAiActions";
import { ShowCorrelationHeatmap } from "./CorrelationHeatmap";
import { ShowHistogramChart } from "./HistogramChart";
import { ShowMissingValuesChart } from "./MissingValuesChart";
import { ShowTrendLineChart } from "./TrendLineChart";

export type ChartTab = "distribution" | "correlation" | "trends" | "missing";

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

/** Build and return a tab button class name. */
function buildTabClass(isActive: boolean): string {
  const baseClass = "rounded-md px-3 py-2 text-left text-sm font-medium";
  return isActive ? `${baseClass} bg-blue-600 text-white` : `${baseClass} text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-slate-800`;
}

/** Show and return the selected chart tab content. */
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

/** Show and return the responsive dashboard chart panel. */
export function ShowChartPanel(props: ChartPanelProps) {
  const { activeTab, analysisResult, jobId, onActiveTabChange, onSelectedColumnChange, selectedColumn } = props;
  const activeLabel = CHART_TABS.find((tab) => tab.value === activeTab)?.label ?? "chart";
  const selectableColumns = buildSelectableColumns(analysisResult, activeTab);

  return (
    <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row">
        {CHART_TABS.map((tab) => (
          <button
            key={tab.value}
            className={buildTabClass(activeTab === tab.value)}
            type="button"
            onClick={() => onActiveTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <ShowChartAiActions chartLabel={activeLabel} jobId={jobId} />
      </div>
      <ShowChartColumnControls columns={selectableColumns} onChange={onSelectedColumnChange} selectedColumn={selectedColumn} />
      <div className="mt-5 max-h-[680px] overflow-auto pr-2">{renderChart(activeTab, analysisResult, selectedColumn)}</div>
    </section>
  );
}

/** Show and return chart column focus controls. */
function ShowChartColumnControls(props: { columns: string[]; onChange: (columnName: string | null) => void; selectedColumn: string | null }) {
  if (!props.columns.length) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button className={buildColumnChipClass(!props.selectedColumn)} type="button" onClick={() => props.onChange(null)}>All columns</button>
      {props.columns.slice(0, 12).map((columnName) => (
        <button
          key={columnName}
          className={buildColumnChipClass(props.selectedColumn === columnName)}
          type="button"
          onClick={() => props.onChange(columnName)}
        >
          {columnName}
        </button>
      ))}
    </div>
  );
}

/** Build and return a column chip class. */
function buildColumnChipClass(isActive: boolean): string {
  const baseClass = "rounded-full px-3 py-1 text-xs font-semibold";
  return isActive ? `${baseClass} bg-blue-600 text-white` : `${baseClass} bg-slate-100 text-slate-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300`;
}

/** Build and return selectable columns for an active chart. */
function buildSelectableColumns(analysisResult: AnalysisResult, activeTab: ChartTab): string[] {
  if (activeTab === "missing") {
    return analysisResult.missingValueSeries.labels;
  }

  return analysisResult.histogramSeries.map((series) => series.columnName);
}

/** Filter and return histogram series by selected column. */
function filterHistogramSeries(series: HistogramSeries[], selectedColumn: string | null): HistogramSeries[] {
  return selectedColumn ? series.filter((item) => item.columnName === selectedColumn) : series;
}

/** Filter and return trend series by selected column. */
function filterTrendSeries(series: TrendSeries[], selectedColumn: string | null): TrendSeries[] {
  return selectedColumn ? series.filter((item) => item.columnName === selectedColumn) : series;
}

/** Filter and return correlation cells by selected column. */
function filterCorrelationCells(cells: CorrelationCell[], selectedColumn: string | null): CorrelationCell[] {
  return selectedColumn ? cells.filter((cell) => cell.xColumn === selectedColumn || cell.yColumn === selectedColumn) : cells;
}

/** Filter and return missing value series by selected column. */
function filterMissingSeries(analysisResult: AnalysisResult, selectedColumn: string | null) {
  if (!selectedColumn) {
    return analysisResult.missingValueSeries;
  }

  const index = analysisResult.missingValueSeries.labels.indexOf(selectedColumn);
  return {
    labels: index >= 0 ? [selectedColumn] : [],
    values: index >= 0 ? [analysisResult.missingValueSeries.values[index]] : [],
  };
}
