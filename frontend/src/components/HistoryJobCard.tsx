import { Calendar, Database } from "lucide-react";
import type { JobHistoryItem } from "../types/history";

type HistoryJobCardProps = {
  job: JobHistoryItem;
  onViewResults: (job: JobHistoryItem) => void;
};

const STATUS_CLASS: Record<JobHistoryItem["status"], string> = {
  done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  failed: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  queued: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

/** Show and return one history job card. */
export function ShowHistoryJobCard({ job, onViewResults }: HistoryJobCardProps) {
  const canViewResults = job.status === "done" && Boolean(job.result_json);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-950 dark:text-white">{job.filename}</h3>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{formatJobDate(job.created_at)}</span>
            <span className="inline-flex items-center gap-1"><Database className="h-4 w-4" />{job.row_count.toLocaleString()} rows / {job.column_count.toLocaleString()} cols</span>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[job.status]}`}>
          {job.status}
        </span>
      </div>
      <button
        className="mt-4 text-sm font-semibold text-blue-700 disabled:text-slate-400 dark:text-blue-300"
        disabled={!canViewResults}
        onClick={() => onViewResults(job)}
        type="button"
      >
        {canViewResults ? "View results" : "Results pending"}
      </button>
    </article>
  );
}

/** Format and return a job upload date label. */
function formatJobDate(createdAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
}
