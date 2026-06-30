import type { CorrelationCell, HistogramSeries, MissingValueSeries, TrendSeries } from "../types/analysis";
import type { ParsedFilePreview, PreviewRow } from "../types/files";
import { isNullCell } from "./analysisMetrics";

const HISTOGRAM_BUCKET_COUNT = 8;

/** Convert a preview value and return a number when possible. */
function toNumber(value: unknown): number | null {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

/** Return numeric values for a column. */
function getNumericValues(rows: PreviewRow[], columnName: string): number[] {
  return rows.map((row) => toNumber(row[columnName])).filter((value) => value !== null);
}

/** Build and return histogram series for numeric columns. */
export function buildHistogramSeries(preview: ParsedFilePreview): HistogramSeries[] {
  return preview.columns.filter((column) => column.type === "number").map((column) => {
    const values = getNumericValues(preview.rows, column.name);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const bucketSize = (maxValue - minValue || 1) / HISTOGRAM_BUCKET_COUNT;
    const buckets = Array.from({ length: HISTOGRAM_BUCKET_COUNT }, () => 0);
    values.forEach((value) => buckets[Math.min(Math.floor((value - minValue) / bucketSize), HISTOGRAM_BUCKET_COUNT - 1)] += 1);
    const labels = buckets.map((_, index) => `${(minValue + index * bucketSize).toFixed(1)}`);
    return { columnName: column.name, labels, values: buckets };
  });
}

/** Build and return line trend series for numeric columns. */
export function buildTrendSeries(preview: ParsedFilePreview): TrendSeries[] {
  return preview.columns.filter((column) => column.type === "number").map((column) => ({
    columnName: column.name,
    points: preview.rows.map((row, index) => ({ x: index, y: toNumber(row[column.name]) ?? 0 })),
  }));
}

/** Build and return missing value counts by column. */
export function buildMissingValueSeries(preview: ParsedFilePreview): MissingValueSeries {
  return {
    labels: preview.columns.map((column) => column.name),
    values: preview.columns.map((column) => preview.rows.filter((row) => isNullCell(row[column.name])).length),
  };
}

/** Build and return correlation heatmap cells for numeric columns. */
export function buildCorrelationCells(preview: ParsedFilePreview): CorrelationCell[] {
  const numericColumns = preview.columns.filter((column) => column.type === "number");
  return numericColumns.flatMap((yColumn) => numericColumns.map((xColumn) => ({
    value: calculateCorrelation(
      getNumericValues(preview.rows, xColumn.name),
      getNumericValues(preview.rows, yColumn.name),
    ),
    xColumn: xColumn.name,
    yColumn: yColumn.name,
  })));
}

/** Calculate and return Pearson correlation for two arrays. */
function calculateCorrelation(firstValues: number[], secondValues: number[]): number {
  const length = Math.min(firstValues.length, secondValues.length);
  const firstMean = firstValues.slice(0, length).reduce((sum, value) => sum + value, 0) / length;
  const secondMean = secondValues.slice(0, length).reduce((sum, value) => sum + value, 0) / length;
  const numerator = firstValues.slice(0, length).reduce((sum, value, index) => sum + (value - firstMean) * (secondValues[index] - secondMean), 0);
  const firstDenominator = firstValues.slice(0, length).reduce((sum, value) => sum + (value - firstMean) ** 2, 0);
  const secondDenominator = secondValues.slice(0, length).reduce((sum, value) => sum + (value - secondMean) ** 2, 0);
  return firstDenominator && secondDenominator ? numerator / Math.sqrt(firstDenominator * secondDenominator) : 0;
}
