import type { ColumnDef } from "@tanstack/react-table";
import type { PreviewCellValue, PreviewColumn, PreviewRow } from "../types/files";

/** Convert and return a cell value for display. */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value as PreviewCellValue);
}

/** Build and return TanStack column definitions. */
export function buildColumns(columns: PreviewColumn[]): ColumnDef<PreviewRow>[] {
  return columns.map((previewColumn) => ({
    accessorFn: (row) => row[previewColumn.name],
    cell: (context) => formatCellValue(context.getValue()),
    id: previewColumn.name,
  }));
}

/** Build and return a map of preview columns by name. */
export function buildColumnMap(columns: PreviewColumn[]): Map<string, PreviewColumn> {
  return new Map(columns.map((column) => [column.name, column]));
}
