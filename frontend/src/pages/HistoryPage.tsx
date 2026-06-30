import { useState } from "react";
import { ShowHistoryFilters } from "../components/HistoryFilters";
import { ShowHistoryJobCard } from "../components/HistoryJobCard";
import { useDashboardResultLoader } from "../hooks/useDashboardResultLoader";
import { useJobHistory } from "../hooks/useJobHistory";
import { jobHistoryFiltersSchema } from "../schemas/historySchemas";
import type { JobHistoryFilters } from "../types/history";

const EMPTY_FILTERS: JobHistoryFilters = { endDate: "", filename: "", startDate: "" };

/** Display and return the job history page shell. */
export function DisplayHistoryPage() {
  const [filters, setFilters] = useState<JobHistoryFilters>(EMPTY_FILTERS);
  const [filterError, setFilterError] = useState<string | null>(null);
  const history = useJobHistory(filters);
  const loadDashboardResult = useDashboardResultLoader();

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">History</h3>
        <div className="mt-5">
          <ShowHistoryFilters filters={filters} onApply={(nextFilters) => applyFilters(nextFilters, setFilters, setFilterError)} />
        </div>
        {filterError ? <p className="mt-3 text-sm font-medium text-red-600">{filterError}</p> : null}
      </div>
      {history.errorMessage ? <p className="text-sm font-medium text-red-600">{history.errorMessage}</p> : null}
      <div className="space-y-4">
        {history.items.map((job) => (
          <ShowHistoryJobCard key={job.job_id} job={job} onViewResults={loadDashboardResult} />
        ))}
      </div>
      {renderHistoryEmptyState(history.items.length, history.isLoading)}
      {history.hasMore ? <div ref={history.sentinelRef} className="h-8" /> : null}
      {history.isLoading ? <p className="text-center text-sm text-slate-500">Loading jobs...</p> : null}
    </section>
  );
}

/** Apply validated filters and return no content. */
function applyFilters(
  filters: JobHistoryFilters,
  setFilters: (filters: JobHistoryFilters) => void,
  setFilterError: (message: string | null) => void,
): void {
  const result = jobHistoryFiltersSchema.safeParse(filters);
  setFilterError(result.success ? null : result.error.issues[0]?.message ?? "Invalid filters.");
  if (result.success) {
    setFilters(result.data);
  }
}

/** Render and return the empty history state when applicable. */
function renderHistoryEmptyState(itemCount: number, isLoading: boolean) {
  if (itemCount || isLoading) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-300">No analysis jobs found.</p>
    </div>
  );
}
