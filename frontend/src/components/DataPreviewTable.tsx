import type { HeaderGroup } from "@tanstack/react-table";
import type { ReactElement } from "react";
import { useDataPreviewTable } from "../hooks/useDataPreviewTable";
import type { ParsedFilePreview, PreviewRow } from "../types/files";
import { ShowDataPreviewHeader } from "./DataPreviewHeader";
import { ShowDataPreviewVirtualRows } from "./DataPreviewVirtualRows";

type DataPreviewTableProps = {
  preview: ParsedFilePreview;
};

/** Show and return an empty data preview state. */
function renderEmptyState(): ReactElement {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      No preview rows are available.
    </div>
  );
}

/** Show and return the table search input. */
function renderSearchInput(value: string, onChange: (value: string) => void): ReactElement {
  return (
    <input
      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      placeholder="Search all columns"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** Show and return table header groups. */
function renderHeaders(
  headerGroups: HeaderGroup<PreviewRow>[],
  columnMap: Map<string, ParsedFilePreview["columns"][number]>,
): ReactElement {
  return (
    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th key={header.id} className="border-b border-slate-200 dark:border-slate-800">
              <ShowDataPreviewHeader header={header} previewColumn={columnMap.get(header.id)} />
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

/** Show and return a virtualized data preview table. */
export function ShowDataPreviewTable({ preview }: DataPreviewTableProps) {
  const tableModel = useDataPreviewTable(preview);

  if (!preview.rows.length) {
    return renderEmptyState();
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        {renderSearchInput(tableModel.globalFilter, tableModel.setGlobalFilter)}
      </div>
      <div ref={tableModel.scrollRef} className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          {renderHeaders(tableModel.headerGroups, tableModel.columnMap)}
          <ShowDataPreviewVirtualRows
            rows={tableModel.rows}
            totalSize={tableModel.totalSize}
            virtualRows={tableModel.virtualRows}
          />
        </table>
      </div>
    </section>
  );
}
