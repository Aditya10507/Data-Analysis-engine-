import type { AnalysisResult } from "../types/analysis";
import type { ParsedFilePreview } from "../types/files";
import { buildCorrelationCells, buildHistogramSeries, buildMissingValueSeries, buildTrendSeries } from "./analysisCharts";
import { buildSummary, calculateDuplicateRowPercent, calculateNullPercent } from "./analysisMetrics";

type AnalysisOptions = {
  columnCount?: number;
  rowCount?: number;
};

/** Build and return the full dashboard analysis result. */
export function buildAnalysisResult(preview: ParsedFilePreview, options: AnalysisOptions = {}): AnalysisResult {
  const rowCount = options.rowCount ?? preview.rows.length;
  const columnCount = options.columnCount ?? preview.columns.length;
  return {
    columnCount,
    correlationCells: buildCorrelationCells(preview),
    duplicateRowPercent: calculateDuplicateRowPercent(preview.rows),
    histogramSeries: buildHistogramSeries(preview),
    missingValueSeries: buildMissingValueSeries(preview),
    nullPercent: calculateNullPercent(preview),
    rowCount,
    summary: buildSummary(rowCount, columnCount, preview.rows.length),
    trendSeries: buildTrendSeries(preview),
  };
}
