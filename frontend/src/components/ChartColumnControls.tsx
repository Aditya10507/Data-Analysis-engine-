type ChartColumnControlsProps = {
  columns: string[];
  onChange: (columnName: string | null) => void;
  selectedColumn: string | null;
};

const MAX_VISIBLE_COLUMN_CHIPS = 12;

/** Show and return chart column focus controls. */
export function ShowChartColumnControls(props: ChartColumnControlsProps) {
  if (!props.columns.length) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button className={buildColumnChipClass(!props.selectedColumn)} type="button" onClick={() => props.onChange(null)}>
        All columns
      </button>
      {props.columns.slice(0, MAX_VISIBLE_COLUMN_CHIPS).map((columnName) => (
        <button
          key={columnName}
          className={buildColumnChipClass(props.selectedColumn === columnName)}
          type="button"
          onClick={() => props.onChange(columnName)}
        >
          {columnName}
        </button>
      ))}
    </div>
  );
}

/** Build and return a column chip class. */
function buildColumnChipClass(isActive: boolean): string {
  const baseClass = "rounded-full px-3 py-1 text-xs font-semibold";
  return isActive ? `${baseClass} bg-blue-600 text-white` : `${baseClass} bg-slate-100 text-slate-600 hover:bg-blue-50 dark:bg-slate-800 dark:text-slate-300`;
}
