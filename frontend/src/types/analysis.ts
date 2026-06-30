export type NumericPoint = {
  x: number;
  y: number;
};

export type HistogramSeries = {
  columnName: string;
  labels: string[];
  values: number[];
};

export type TrendSeries = {
  columnName: string;
  points: NumericPoint[];
};

export type MissingValueSeries = {
  labels: string[];
  values: number[];
};

export type CorrelationCell = {
  xColumn: string;
  yColumn: string;
  value: number;
};

export type AnalysisResult = {
  columnCount: number;
  correlationCells: CorrelationCell[];
  duplicateRowPercent: number;
  histogramSeries: HistogramSeries[];
  missingValueSeries: MissingValueSeries;
  nullPercent: number;
  rowCount: number;
  summary: string;
  trendSeries: TrendSeries[];
};
