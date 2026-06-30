import type { ParsedFilePreview, PreviewCellValue, PreviewRow } from "../types/files";

const PERCENT_MULTIPLIER = 100;

/** Return whether a preview cell should count as null. */
export function isNullCell(value: PreviewCellValue): boolean {
  return value === null || value === "";
}

/** Calculate and return the overall null percentage. */
export function calculateNullPercent(preview: ParsedFilePreview): number {
  const totalCells = preview.rows.length * preview.columns.length;
  const nullCount = preview.rows.flatMap((row) => preview.columns.map((column) => row[column.name]))
    .filter(isNullCell).length;
  return totalCells ? (nullCount / totalCells) * PERCENT_MULTIPLIER : 0;
}

/** Calculate and return the duplicate row percentage. */
export function calculateDuplicateRowPercent(rows: PreviewRow[]): number {
  const seenRows = new Set<string>();
  let duplicateCount = 0;

  rows.forEach((row) => {
    const rowSignature = JSON.stringify(row);
    duplicateCount += seenRows.has(rowSignature) ? 1 : 0;
    seenRows.add(rowSignature);
  });

  return rows.length ? (duplicateCount / rows.length) * PERCENT_MULTIPLIER : 0;
}

/** Build and return a concise dashboard summary. */
export function buildSummary(preview: ParsedFilePreview): string {
  return `${preview.rows.length} rows across ${preview.columns.length} columns are ready for analysis.`;
}
