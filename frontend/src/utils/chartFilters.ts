import type { AnalysisResult, CorrelationCell, HistogramSeries, TrendSeries } from "../types/analysis";
import type { ChartTab } from "../components/ChartPanel";

/** Build and return selectable columns for an active chart. */
export function buildSelectableColumns(analysisResult: AnalysisResult, activeTab: ChartTab): string[] {
  if (activeTab === "missing") {
    return analysisResult.missingValueSeries.labels;
  }

  return analysisResult.histogramSeries.map((series) => series.columnName);
}

/** Filter and return histogram series by selected column. */
export function filterHistogramSeries(series: HistogramSeries[], selectedColumn: string | null): HistogramSeries[] {
  return selectedColumn ? series.filter((item) => item.columnName === selectedColumn) : series;
}

/** Filter and return trend series by selected column. */
export function filterTrendSeries(series: TrendSeries[], selectedColumn: string | null): TrendSeries[] {
  return selectedColumn ? series.filter((item) => item.columnName === selectedColumn) : series;
}

/** Filter and return correlation cells by selected column. */
export function filterCorrelationCells(cells: CorrelationCell[], selectedColumn: string | null): CorrelationCell[] {
  return selectedColumn ? cells.filter((cell) => cell.xColumn === selectedColumn || cell.yColumn === selectedColumn) : cells;
}

/** Filter and return missing value series by selected column. */
export function filterMissingSeries(analysisResult: AnalysisResult, selectedColumn: string | null) {
  if (!selectedColumn) {
    return analysisResult.missingValueSeries;
  }

  const index = analysisResult.missingValueSeries.labels.indexOf(selectedColumn);
  return {
    labels: index >= 0 ? [selectedColumn] : [],
    values: index >= 0 ? [analysisResult.missingValueSeries.values[index]] : [],
  };
}
