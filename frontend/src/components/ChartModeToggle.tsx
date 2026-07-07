import type { ChartMode } from "./ChartPanel";

type ChartModeToggleProps = {
  chartMode: ChartMode;
  onChartModeChange: (chartMode: ChartMode) => void;
};

/** Show and return a 2D/3D chart mode toggle. */
export function ShowChartModeToggle(props: ChartModeToggleProps) {
  return (
    <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
      <button className={buildModeButtonClass(props.chartMode === "2d")} type="button" onClick={() => props.onChartModeChange("2d")}>
        2D view
      </button>
      <button className={buildModeButtonClass(props.chartMode === "3d")} type="button" onClick={() => props.onChartModeChange("3d")}>
        360-degree 3D view
      </button>
    </div>
  );
}

/** Build and return a chart mode button class. */
function buildModeButtonClass(isActive: boolean): string {
  const baseClass = "rounded-md px-3 py-1.5 text-xs font-semibold";
  return isActive ? `${baseClass} bg-blue-600 text-white` : `${baseClass} text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900`;
}
