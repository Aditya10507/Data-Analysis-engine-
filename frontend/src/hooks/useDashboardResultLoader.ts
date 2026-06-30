import { useCallback, useMemo } from "react";
import { useAppStore } from "../store/appStore";
import type { JobHistoryItem } from "../types/history";
import { loadJobResultIntoDashboard, type DashboardLoadActions } from "../utils/dashboardLoader";

/** Build and return a callback that loads a history job into the dashboard. */
export function useDashboardResultLoader() {
  const actions = useDashboardLoadActions();
  return useCallback((job: JobHistoryItem) => {
    if (job.result_json) {
      loadJobResultIntoDashboard(job.result_json, actions);
    }
  }, [actions]);
}

/** Read and return stable dashboard loading actions from the store. */
function useDashboardLoadActions(): DashboardLoadActions {
  const setActiveView = useAppStore((state) => state.setActiveView);
  const setAnalysisResult = useAppStore((state) => state.setAnalysisResult);
  const setJobErrorMessage = useAppStore((state) => state.setJobErrorMessage);
  const setJobId = useAppStore((state) => state.setJobId);
  const setJobResult = useAppStore((state) => state.setJobResult);
  const setParsedPreview = useAppStore((state) => state.setParsedPreview);
  const setStatus = useAppStore((state) => state.setStatus);
  return useMemo(() => ({
    setActiveView,
    setAnalysisResult,
    setJobErrorMessage,
    setJobId,
    setJobResult,
    setParsedPreview,
    setStatus,
  }), [setActiveView, setAnalysisResult, setJobErrorMessage, setJobId, setJobResult, setParsedPreview, setStatus]);
}
