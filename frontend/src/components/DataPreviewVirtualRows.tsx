import { flexRender, type Row } from "@tanstack/react-table";
import type { VirtualItem } from "@tanstack/react-virtual";
import type { PreviewRow } from "../types/files";

type DataPreviewVirtualRowsProps = {
  rows: Row<PreviewRow>[];
  totalSize: number;
  virtualRows: VirtualItem[];
};

/** Show and return virtualized table body rows. */
export function ShowDataPreviewVirtualRows({
  rows,
  totalSize,
  virtualRows,
}: DataPreviewVirtualRowsProps) {
  return (
    <tbody className="relative block" style={{ height: `${totalSize}px` }}>
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <tr
            key={row.id}
            className="absolute left-0 grid w-full grid-flow-col border-b border-slate-100 odd:bg-white even:bg-slate-50 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-950"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="min-w-40 truncate px-3 py-3 text-slate-700 dark:text-slate-200">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
}
