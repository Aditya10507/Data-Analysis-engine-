import { useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisResult } from "../types/analysis";
import { loadPlotly } from "../utils/plotlyLoader";
import { buildPlotly3DFigure, type PlotlyFigure } from "../utils/plotly3dFigures";
import type { ChartTab } from "./ChartPanel";

type Plotly3DChartProps = {
  activeTab: ChartTab;
  analysisResult: AnalysisResult;
  selectedColumn: string | null;
};

/** Show and return an interactive Plotly 3D chart. */
export function ShowPlotly3DChart({ activeTab, analysisResult, selectedColumn }: Plotly3DChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const figure = useMemo(() => buildPlotly3DFigure(activeTab, analysisResult, selectedColumn), [activeTab, analysisResult, selectedColumn]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    let isCancelled = false;
    setErrorMessage(null);
    void renderPlotlyFigure(containerRef.current, figure, () => isCancelled).catch((error: unknown) => {
      if (!isCancelled) {
        console.error("Plotly render failed", error);
        setErrorMessage("3D view could not load. Please switch back to 2D view.");
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [figure]);

  useEffect(() => () => {
    if (containerRef.current) {
      purgePlotlyFigure(containerRef.current);
    }
  }, []);

  return (
    <div className="relative h-[620px] min-w-[880px] rounded-lg bg-white dark:bg-slate-950">
      {errorMessage ? <p className="absolute left-4 top-4 z-10 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

/** Render a Plotly figure and return no content. */
async function renderPlotlyFigure(element: HTMLDivElement, figure: PlotlyFigure, isCancelled: () => boolean): Promise<void> {
  const plotly = await loadPlotly();
  if (!isCancelled()) {
    await plotly.react(element, figure.data, figure.layout, { displaylogo: false, responsive: true });
  }
}

/** Purge a Plotly figure and return no content. */
function purgePlotlyFigure(element: HTMLDivElement): void {
  if (window.Plotly) {
    window.Plotly.purge(element);
  }
}
