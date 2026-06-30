import { jobResultSchema } from "../schemas/jobResultSchemas";
import type { JobResult, ParsedFilePreview, PreviewColumn } from "../types/files";
import { buildAnalysisResult } from "./analysisResult";

/** Parse and return a completed backend job result. */
export function parseJobResult(resultJson: Record<string, unknown> | null): JobResult | null {
  if (!resultJson) {
    return null;
  }

  return jobResultSchema.parse(resultJson);
}

/** Build and return frontend preview data from a completed job result. */
export function buildPreviewFromJobResult(jobResult: JobResult): ParsedFilePreview {
  return {
    columns: buildPreviewColumns(jobResult),
    rows: jobResult.preview,
  };
}

/** Build and return dashboard analysis data from a completed job result. */
export function buildAnalysisFromJobResult(jobResult: JobResult) {
  return buildAnalysisResult(buildPreviewFromJobResult(jobResult));
}

/** Build and return preview columns from result metadata. */
function buildPreviewColumns(jobResult: JobResult): PreviewColumn[] {
  const columnNames = Object.keys(jobResult.column_meta);
  return columnNames.map((columnName) => ({
    name: columnName,
    type: inferColumnType(jobResult.column_meta[columnName]),
  }));
}

/** Infer and return a preview column type from backend metadata. */
function inferColumnType(meta: { dtype?: string | null; semantic_type?: string | null }): PreviewColumn["type"] {
  const semanticType = meta.semantic_type ?? "";
  const dtype = meta.dtype ?? "";
  if (semanticType === "date" || dtype.includes("datetime")) {
    return "date";
  }

  if (semanticType === "boolean" || dtype.includes("bool")) {
    return "boolean";
  }

  return dtype.includes("int") || dtype.includes("float") ? "number" : "text";
}
