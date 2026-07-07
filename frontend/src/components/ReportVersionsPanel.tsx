import { History } from "lucide-react";
import { useReportVersions } from "../hooks/useReportVersions";
import { useAppStore } from "../store/appStore";
import type { JobResult } from "../types/files";
import type { ReportVersion } from "../types/reportVersions";
import { loadJobResultIntoDashboard } from "../utils/dashboardLoader";

type ReportVersionsPanelProps = {
  jobResult: JobResult | null;
};

/** Show and return saved report versions for the current job. */
export function ShowReportVersionsPanel({ jobResult }: ReportVersionsPanelProps) {
  const actions = useDashboardActions();
  const state = useReportVersions(jobResult?.job_id ?? null);

  if (!jobResult) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-blue-600" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Saved report versions</h3>
      </div>
      {state.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading versions...</p> : null}
      {state.errorMessage ? <p className="mt-3 text-sm text-red-600">{state.errorMessage}</p> : null}
      {!state.isLoading && !state.versions.length ? <p className="mt-3 text-sm text-slate-500">No saved versions yet.</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {state.versions.map((version) => (
          <ShowVersionButton key={version.version_id} version={version} onLoad={() => loadJobResultIntoDashboard(version.result_json, actions)} />
        ))}
      </div>
    </section>
  );
}

/** Show and return one report version button. */
function ShowVersionButton({ onLoad, version }: { onLoad: () => void; version: ReportVersion }) {
  return (
    <button
      className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
      type="button"
      onClick={onLoad}
    >
      <span className="block">Version {version.version_number}</span>
      <span className="font-normal text-slate-500">{formatVersionDate(version.created_at)}</span>
    </button>
  );
}

/** Read and return dashboard loading actions from the store. */
function useDashboardActions() {
  return {
    setActiveView: useAppStore((state) => state.setActiveView),
    setAnalysisResult: useAppStore((state) => state.setAnalysisResult),
    setJobErrorMessage: useAppStore((state) => state.setJobErrorMessage),
    setJobId: useAppStore((state) => state.setJobId),
    setJobResult: useAppStore((state) => state.setJobResult),
    setParsedPreview: useAppStore((state) => state.setParsedPreview),
    setStatus: useAppStore((state) => state.setStatus),
  };
}

/** Format and return a report version date. */
function formatVersionDate(createdAt: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(createdAt));
}
