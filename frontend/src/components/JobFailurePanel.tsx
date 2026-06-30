import { AlertTriangle, RotateCcw } from "lucide-react";

type JobFailurePanelProps = {
  errorMessage: string;
  onRetry: () => void;
};

/** Show and return a failed job panel with retry action. */
export function ShowJobFailurePanel({ errorMessage, onRetry }: JobFailurePanelProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-white p-4 dark:border-red-900 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-300" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-200">Job failed</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{errorMessage}</p>
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onRetry}
          type="button"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      </div>
    </section>
  );
}
