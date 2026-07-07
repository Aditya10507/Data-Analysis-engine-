import type { AnalysisStatus } from "./app";
import type { InsightKind } from "./insights";

export type ColumnType = "number" | "text" | "date" | "boolean";

export type PreviewCellValue = string | number | boolean | null;

export type PreviewRow = Record<string, PreviewCellValue>;

export type PreviewColumn = {
  name: string;
  type: ColumnType;
};

export type ParsedFilePreview = {
  columns: PreviewColumn[];
  rows: PreviewRow[];
};

export type FilePreview = {
  name: string;
  sizeLabel: string;
  rowCount: number | null;
};

export type UploadJob = {
  job_id: string;
  status: AnalysisStatus;
};

export type CleaningActionName = "fill_nulls" | "remove_duplicates" | "clip_outliers" | "parse_dates";

export type CleaningReviewAction = {
  action: CleaningActionName;
  column_count: number;
  description: string;
  is_enabled: boolean;
  label: string;
  row_count: number;
};

export type CleaningReviewPlan = {
  actions: CleaningReviewAction[];
  initial_rows: number;
};

export type JobResultInsight = {
  body: string;
  headline: string;
  type: InsightKind;
};

export type DataQualityIssue = {
  label: string;
  severity: "info" | "warning";
  value: string;
};

export type DataQualityScore = {
  duplicate_percent: number;
  grade: string;
  issues: DataQualityIssue[];
  null_percent: number;
  outlier_percent: number;
  score: number;
};

export type JobResult = {
  column_meta: Record<string, { dtype?: string | null; semantic_type?: string | null }>;
  data_quality?: DataQualityScore;
  download_urls: { cleaned_csv: string; original: string };
  filename: string;
  insights: JobResultInsight[];
  job_id: string;
  preview: PreviewRow[];
  shape: [number, number];
  status: string;
};

export type JobStatus = {
  error_msg: string | null;
  job_id: string;
  result_json: Record<string, unknown> | null;
  status: AnalysisStatus;
};
