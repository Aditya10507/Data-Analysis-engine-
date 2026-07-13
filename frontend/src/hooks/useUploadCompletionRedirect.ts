import { useEffect, useRef } from "react";
import { useAppStore } from "../store/appStore";
import { useToastStore } from "../store/toastStore";

const DASHBOARD_REDIRECT_DELAY_MS = 1400;

/** Redirect a newly completed upload to its dashboard after confirming valid results. */
export function useUploadCompletionRedirect(): void {
  const status = useAppStore((state) => state.status);
  const jobId = useAppStore((state) => state.jobId);
  const jobResult = useAppStore((state) => state.jobResult);
  const analysisResult = useAppStore((state) => state.analysisResult);
  const setActiveView = useAppStore((state) => state.setActiveView);
  const addToast = useToastStore((state) => state.addToast);
  const handledJobId = useRef(status === "done" ? jobId : null);

  useEffect(() => {
    const isReady = status === "done" && Boolean(jobId && jobResult && analysisResult);
    if (!isReady || handledJobId.current === jobId) return undefined;
    handledJobId.current = jobId;
    addToast({ kind: "success", title: "Analysis complete", message: "Your dashboard is ready. Opening results now." });
    const timerId = window.setTimeout(() => setActiveView("dashboard"), DASHBOARD_REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, [addToast, analysisResult, jobId, jobResult, setActiveView, status]);
}
