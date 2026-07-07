import type { AnalysisResult, CorrelationCell, HistogramSeries, NumericPoint, TrendSeries } from "../types/analysis";
import type { ChartTab } from "../components/ChartPanel";
import { filterHistogramSeries, filterTrendSeries } from "./chartFilters";

const MAX_3D_SERIES = 10;
const MAX_3D_POINTS = 450;
const MAX_3D_SURFACE_COLUMNS = 24;
const MAX_3D_MISSING_COLUMNS = 40;
const MARKER_SIZE = 5;

export type PlotlyFigure = {
  data: Record<string, unknown>[];
  layout: Record<string, unknown>;
};

/** Build and return a Plotly figure for the active chart. */
export function buildPlotly3DFigure(activeTab: ChartTab, analysisResult: AnalysisResult, selectedColumn: string | null): PlotlyFigure {
  if (activeTab === "correlation") {
    return buildCorrelationFigure(analysisResult.correlationCells, selectedColumn);
  }

  if (activeTab === "trends") {
    return buildTrendFigure(filterTrendSeries(analysisResult.trendSeries, selectedColumn));
  }

  if (activeTab === "missing") {
    return buildMissingFigure(analysisResult, selectedColumn);
  }

  return buildDistributionFigure(filterHistogramSeries(analysisResult.histogramSeries, selectedColumn));
}

/** Build and return a 3D distribution figure. */
function buildDistributionFigure(series: HistogramSeries[]): PlotlyFigure {
  const traces = series.slice(0, MAX_3D_SERIES).map((item, seriesIndex) => ({
    mode: "markers+lines",
    name: item.columnName,
    type: "scatter3d",
    x: item.labels.map((_, index) => index),
    y: item.labels.map(() => seriesIndex),
    z: item.values,
    marker: { size: MARKER_SIZE },
    text: item.labels,
  }));
  return { data: traces, layout: buildLayout("3D Distribution", "Bucket", "Column", "Count") };
}

/** Build and return a 3D trend figure. */
function buildTrendFigure(series: TrendSeries[]): PlotlyFigure {
  const traces = series.slice(0, MAX_3D_SERIES).map((item, seriesIndex) => {
    const sampledPoints = samplePoints(item.points);
    return {
      line: { width: 5 },
      mode: "lines",
      name: item.columnName,
      type: "scatter3d",
      x: sampledPoints.map((point) => point.x),
      y: sampledPoints.map(() => seriesIndex),
      z: sampledPoints.map((point) => point.y),
    };
  });
  return { data: traces, layout: buildLayout("3D Trends", "Row index", "Column", "Value") };
}

/** Build and return a 3D missing values figure. */
function buildMissingFigure(analysisResult: AnalysisResult, selectedColumn: string | null): PlotlyFigure {
  const labels = selectedColumn ? [selectedColumn] : analysisResult.missingValueSeries.labels.slice(0, MAX_3D_MISSING_COLUMNS);
  const values = labels.map((label) => readMissingValue(analysisResult, label));
  return {
    data: [buildMissingTrace(labels, values)],
    layout: buildLayout("3D Missing Values", "Column", "Baseline", "Missing cells"),
  };
}

/** Build and return a missing value trace. */
function buildMissingTrace(labels: string[], values: number[]): Record<string, unknown> {
  return {
    mode: "markers+text",
    type: "scatter3d",
    x: labels.map((_, index) => index),
    y: labels.map(() => 0),
    z: values,
    text: labels,
    marker: { size: 9 },
  };
}

/** Build and return a 3D correlation surface figure. */
function buildCorrelationFigure(cells: CorrelationCell[], selectedColumn: string | null): PlotlyFigure {
  const filteredCells = selectedColumn ? cells.filter((cell) => cell.xColumn === selectedColumn || cell.yColumn === selectedColumn) : cells;
  const labels = Array.from(new Set(filteredCells.flatMap((cell) => [cell.xColumn, cell.yColumn]))).slice(0, MAX_3D_SURFACE_COLUMNS);
  const matrix = labels.map((yLabel) => labels.map((xLabel) => readCorrelationValue(filteredCells, xLabel, yLabel)));
  return {
    data: [{ colorscale: "RdBu", type: "surface", x: labels, y: labels, z: matrix }],
    layout: buildLayout("3D Correlation Surface", "X column", "Y column", "Correlation"),
  };
}

/** Sample and return trend points for smooth 3D rendering. */
function samplePoints(points: NumericPoint[]): NumericPoint[] {
  if (points.length <= MAX_3D_POINTS) {
    return points;
  }

  const stepSize = Math.ceil(points.length / MAX_3D_POINTS);
  return points.filter((_, index) => index % stepSize === 0);
}

/** Build and return the shared 3D layout. */
function buildLayout(title: string, xTitle: string, yTitle: string, zTitle: string): Record<string, unknown> {
  return {
    margin: { b: 0, l: 0, r: 0, t: 42 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    scene: { camera: { eye: { x: 1.6, y: 1.6, z: 1.2 } }, xaxis: { title: xTitle }, yaxis: { title: yTitle }, zaxis: { title: zTitle } },
    title,
  };
}

/** Read and return one missing value count. */
function readMissingValue(analysisResult: AnalysisResult, label: string): number {
  const index = analysisResult.missingValueSeries.labels.indexOf(label);
  return index >= 0 ? analysisResult.missingValueSeries.values[index] : 0;
}

/** Read and return one correlation value. */
function readCorrelationValue(cells: CorrelationCell[], xColumn: string, yColumn: string): number {
  return cells.find((cell) => cell.xColumn === xColumn && cell.yColumn === yColumn)?.value ?? 0;
}
