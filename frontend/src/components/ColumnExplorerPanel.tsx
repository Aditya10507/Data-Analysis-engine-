import { Columns3, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ParsedFilePreview, PreviewCellValue, PreviewColumn, PreviewRow } from "../types/files";

const SAMPLE_LIMIT = 6;

type ColumnExplorerPanelProps = {
  onFocusColumn: (columnName: string) => void;
  preview: ParsedFilePreview;
  selectedColumn: string | null;
};

type ColumnProfile = {
  missingCount: number;
  sampleValues: string[];
  uniqueCount: number;
};

/** Show and return an interactive column explorer. */
export function ShowColumnExplorerPanel({ onFocusColumn, preview, selectedColumn }: ColumnExplorerPanelProps) {
  const [query, setQuery] = useState("");
  const visibleColumns = useMemo(() => filterColumns(preview.columns, query), [preview.columns, query]);
  const activeColumn = findActiveColumn(visibleColumns, selectedColumn);
  const profile = activeColumn ? buildColumnProfile(preview.rows, activeColumn.name) : null;

  return (
    <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(220px,320px)_1fr]">
      <div>
        <div className="flex items-center gap-2">
          <Columns3 className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Column explorer</h3>
        </div>
        <ShowColumnSearch query={query} onQueryChange={setQuery} />
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
          {visibleColumns.map((column) => (
            <button
              key={column.name}
              className={buildColumnButtonClass(column.name === activeColumn?.name)}
              type="button"
              onClick={() => onFocusColumn(column.name)}
            >
              <span className="truncate font-semibold">{column.name}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {column.type}
              </span>
            </button>
          ))}
        </div>
      </div>
      {activeColumn && profile ? <ShowColumnProfile column={activeColumn} profile={profile} /> : null}
    </section>
  );
}

/** Show and return column search input. */
function ShowColumnSearch({ onQueryChange, query }: { onQueryChange: (query: string) => void; query: string }) {
  return (
    <label className="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
      <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white"
        placeholder="Search columns"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </label>
  );
}

/** Show and return the active column profile. */
function ShowColumnProfile({ column, profile }: { column: PreviewColumn; profile: ColumnProfile }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Selected column</p>
      <h4 className="mt-2 break-words text-2xl font-semibold text-slate-950 dark:text-white">{column.name}</h4>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ShowProfileMetric label="Type" value={column.type} />
        <ShowProfileMetric label="Unique" value={profile.uniqueCount.toLocaleString()} />
        <ShowProfileMetric label="Missing" value={profile.missingCount.toLocaleString()} />
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sample values</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.sampleValues.map((value) => (
            <span key={value} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Show and return one column profile metric. */
function ShowProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold capitalize text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

/** Filter and return columns matching a query. */
function filterColumns(columns: PreviewColumn[], query: string): PreviewColumn[] {
  const normalizedQuery = query.trim().toLowerCase();
  return normalizedQuery ? columns.filter((column) => column.name.toLowerCase().includes(normalizedQuery)) : columns;
}

/** Find and return the active column. */
function findActiveColumn(columns: PreviewColumn[], selectedColumn: string | null): PreviewColumn | null {
  return columns.find((column) => column.name === selectedColumn) ?? columns[0] ?? null;
}

/** Build and return profile details for one column. */
function buildColumnProfile(rows: PreviewRow[], columnName: string): ColumnProfile {
  const values = rows.map((row) => row[columnName]);
  const presentValues = values.filter((value) => value !== null && value !== "");
  const sampleValues = Array.from(new Set(presentValues.map(formatValue))).slice(0, SAMPLE_LIMIT);
  return { missingCount: values.length - presentValues.length, sampleValues, uniqueCount: new Set(presentValues.map(formatValue)).size };
}

/** Format and return a display value. */
function formatValue(value: PreviewCellValue): string {
  return value === null ? "null" : String(value);
}

/** Build and return a column button class. */
function buildColumnButtonClass(isActive: boolean): string {
  const baseClass = "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm";
  return isActive ? `${baseClass} bg-blue-600 text-white` : `${baseClass} bg-slate-50 text-slate-700 hover:bg-blue-50 dark:bg-slate-950 dark:text-slate-200`;
}
