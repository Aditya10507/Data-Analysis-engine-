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

export type JobResultInsight = {
  body: string;
  headline: string;
  type: InsightKind;
};

export type JobResult = {
  column_meta: Record<string, { dtype?: string | null; semantic_type?: string | null }>;
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
