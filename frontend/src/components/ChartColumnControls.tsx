import { ListFilter } from "lucide-react";

type ChartColumnControlsProps = {
  columns: string[];
  onChange: (columnName: string | null) => void;
  selectedColumn: string | null;
};

/** Show and return chart column focus controls. */
export function ShowChartColumnControls(props: ChartColumnControlsProps) {
  if (!props.columns.length) {
    return null;
  }

  return (
    <div className="mt-4 flex max-w-md items-center gap-3">
      <ListFilter className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <label className="min-w-0 flex-1"><span className="sr-only">Focus chart on a column</span><select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" value={props.selectedColumn ?? ""} onChange={(event) => props.onChange(event.target.value || null)}><option value="">All available columns</option>{props.columns.map((columnName) => <option key={columnName} value={columnName}>{columnName}</option>)}</select></label>
    </div>
  );
}
