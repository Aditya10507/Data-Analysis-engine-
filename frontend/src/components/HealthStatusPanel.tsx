import type { ReactElement } from "react";
import type { HealthStatus } from "../types/api";

type HealthStatusPanelProps = {
  healthStatus: HealthStatus | null;
  errorMessage: string | null;
  isLoading: boolean;
};

const READY_LABEL = "Backend API";
const EMPTY_LABEL = "Waiting for API status.";

/** Render and return the loading health status panel. */
function renderLoadingPanel(): ReactElement {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-300">Checking API connection...</p>
    </section>
  );
}

/** Render and return the failed health status panel. */
function renderErrorPanel(errorMessage: string): ReactElement {
  return (
    <section className="rounded-lg border border-red-200 bg-white p-6 dark:border-red-900 dark:bg-slate-900">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
    </section>
  );
}

/** Render and return the empty health status panel. */
function renderEmptyPanel(): ReactElement {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-600 dark:text-slate-300">{EMPTY_LABEL}</p>
    </section>
  );
}

/** Render and return the ready health status panel. */
function renderReadyPanel(healthStatus: HealthStatus): ReactElement {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
        {READY_LABEL}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
        {healthStatus.status}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{healthStatus.service}</p>
    </section>
  );
}

/** Show and return the current backend health status panel. */
export function ShowHealthStatusPanel({
  healthStatus,
  errorMessage,
  isLoading,
}: HealthStatusPanelProps) {
  if (isLoading) {
    return renderLoadingPanel();
  }

  if (errorMessage) {
    return renderErrorPanel(errorMessage);
  }

  if (!healthStatus) {
    return renderEmptyPanel();
  }

  return renderReadyPanel(healthStatus);
}
