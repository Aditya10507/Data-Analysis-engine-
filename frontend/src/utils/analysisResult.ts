import type { AnalysisResult } from "../types/analysis";
import type { ParsedFilePreview } from "../types/files";
import { buildCorrelationCells, buildHistogramSeries, buildMissingValueSeries, buildTrendSeries } from "./analysisCharts";
import { buildSummary, calculateDuplicateRowPercent, calculateNullPercent } from "./analysisMetrics";

/** Build and return the full dashboard analysis result. */
export function buildAnalysisResult(preview: ParsedFilePreview): AnalysisResult {
  return {
    columnCount: preview.columns.length,
    correlationCells: buildCorrelationCells(preview),
    duplicateRowPercent: calculateDuplicateRowPercent(preview.rows),
    histogramSeries: buildHistogramSeries(preview),
    missingValueSeries: buildMissingValueSeries(preview),
    nullPercent: calculateNullPercent(preview),
    rowCount: preview.rows.length,
    summary: buildSummary(preview),
    trendSeries: buildTrendSeries(preview),
  };
}
