import { Database } from "lucide-react";
import type { AnalysisResult } from "../types/analysis";
import type { JobResult, ParsedFilePreview, PreviewColumn } from "../types/files";
import { ShowDataQualityBadge } from "./DataQualityBadge";

type DatasetOverviewPanelProps = {
  analysisResult: AnalysisResult;
  jobResult: JobResult | null;
  preview: ParsedFilePreview | null;
};

type OverviewMetric = {
  label: string;
  value: string;
};

/** Show and return the dataset overview panel. */
export function ShowDatasetOverviewPanel({ analysisResult, jobResult, preview }: DatasetOverviewPanelProps) {
  const typeCounts = countColumnTypes(preview?.columns ?? []);
  const metrics = buildOverviewMetrics(analysisResult, jobResult, preview);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Dataset overview</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
            {jobResult?.filename ?? "Current dataset"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {analysisResult.summary}
          </p>
        </div>
        <ShowDataQualityBadge dataQuality={jobResult?.data_quality ?? null} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <ShowOverviewMetric key={metric.label} metric={metric} />)}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {Object.entries(typeCounts).map(([type, count]) => (
          <span key={type} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {type}: {count}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Show and return one overview metric. */
function ShowOverviewMetric({ metric }: { metric: OverviewMetric }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <Database className="h-5 w-5 text-blue-600" aria-hidden="true" />
      <div>
        <p className="text-xs font-medium text-slate-500">{metric.label}</p>
        <p className="text-lg font-semibold text-slate-950 dark:text-white">{metric.value}</p>
      </div>
    </div>
  );
}

/** Build and return overview metrics. */
function buildOverviewMetrics(
  analysisResult: AnalysisResult,
  jobResult: JobResult | null,
  preview: ParsedFilePreview | null,
): OverviewMetric[] {
  return [
    { label: "Rows", value: analysisResult.rowCount.toLocaleString() },
    { label: "Columns", value: analysisResult.columnCount.toLocaleString() },
    { label: "Interactive sample", value: (preview?.rows.length ?? 0).toLocaleString() },
    { label: "Quality grade", value: jobResult?.data_quality?.grade ?? "Pending" },
    { label: "File", value: jobResult?.filename ?? "Uploaded dataset" },
    { label: "Download", value: jobResult?.download_urls.cleaned_csv ? "Cleaned CSV ready" : "Not ready" },
    { label: "Nulls", value: `${analysisResult.nullPercent.toFixed(1)}%` },
    { label: "Duplicates", value: `${analysisResult.duplicateRowPercent.toFixed(1)}%` },
  ];
}

/** Count and return column types. */
function countColumnTypes(columns: PreviewColumn[]): Record<string, number> {
  return columns.reduce<Record<string, number>>((counts, column) => {
    counts[column.type] = (counts[column.type] ?? 0) + 1;
    return counts;
  }, {});
}
