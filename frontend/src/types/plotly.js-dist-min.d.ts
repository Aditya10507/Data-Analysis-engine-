type PlotlyConfig = {
  displaylogo?: boolean;
  responsive?: boolean;
};

type PlotlyLayout = Record<string, unknown>;
type PlotlyTrace = Record<string, unknown>;

type BrowserPlotly = {
  newPlot: (
    element: HTMLDivElement,
    data: PlotlyTrace[],
    layout: PlotlyLayout,
    config?: PlotlyConfig,
  ) => Promise<unknown>;
  react: (
    element: HTMLDivElement,
    data: PlotlyTrace[],
    layout: PlotlyLayout,
    config?: PlotlyConfig,
  ) => Promise<unknown>;
  purge: (element: HTMLDivElement) => void;
};

interface Window {
  Plotly?: BrowserPlotly;
}
