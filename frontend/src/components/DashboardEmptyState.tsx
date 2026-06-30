import { BarChart3, Upload } from "lucide-react";

type DashboardEmptyStateProps = {
  onUploadClick: () => void;
};

/** Show and return an empty dashboard illustration and CTA. */
export function ShowDashboardEmptyState({ onUploadClick }: DashboardEmptyStateProps) {
  return (
    <section className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="max-w-sm">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
          <BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-300" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-slate-950 dark:text-white">
          Upload a file to get started
        </h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Your KPIs, charts, preview table, and AI insights will appear here after processing.
        </p>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          onClick={onUploadClick}
          type="button"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload file
        </button>
      </div>
    </section>
  );
}
