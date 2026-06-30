import type { Header } from "@tanstack/react-table";
import type { ColumnType, PreviewColumn, PreviewRow } from "../types/files";

type DataPreviewHeaderProps = {
  header: Header<PreviewRow, unknown>;
  previewColumn: PreviewColumn | undefined;
};

const BADGE_CLASSES: Record<ColumnType, string> = {
  boolean: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
  date: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200",
  number: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  text: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

/** Build and return the sort indicator for a header cell. */
function buildSortLabel(header: Header<PreviewRow, unknown>): string {
  const sortState = header.column.getIsSorted();

  if (sortState === "asc") {
    return "Asc";
  }

  if (sortState === "desc") {
    return "Desc";
  }

  return "";
}

/** Show and return a typed data preview header cell. */
export function ShowDataPreviewHeader({ header, previewColumn }: DataPreviewHeaderProps) {
  const columnType = previewColumn?.type ?? "text";
  const sortLabel = buildSortLabel(header);

  return (
    <button
      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
      type="button"
      onClick={header.column.getToggleSortingHandler()}
    >
      <span className="truncate">{previewColumn?.name ?? header.id}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className={`rounded-full px-2 py-1 normal-case ${BADGE_CLASSES[columnType]}`}>
          {columnType}
        </span>
        {sortLabel ? <span className="normal-case text-slate-400">{sortLabel}</span> : null}
      </span>
    </button>
  );
}
