import type { AnalysisStatus, AppView } from "../types/app";
import type { JobResult, ParsedFilePreview } from "../types/files";
import type { AnalysisResult } from "../types/analysis";
import { buildAnalysisFromJobResult, buildPreviewFromJobResult } from "./jobResult";

export type DashboardLoadActions = {
  setActiveView: (activeView: AppView) => void;
  setAnalysisResult: (analysisResult: AnalysisResult | null) => void;
  setJobErrorMessage: (jobErrorMessage: string | null) => void;
  setJobId: (jobId: string | null) => void;
  setJobResult: (jobResult: JobResult | null) => void;
  setParsedPreview: (parsedPreview: ParsedFilePreview | null) => void;
  setStatus: (status: AnalysisStatus) => void;
};

/** Load a completed job result into dashboard state and return no content. */
export function loadJobResultIntoDashboard(
  jobResult: JobResult,
  actions: DashboardLoadActions,
): void {
  actions.setJobId(jobResult.job_id);
  actions.setStatus("done");
  actions.setJobErrorMessage(null);
  actions.setJobResult(jobResult);
  actions.setParsedPreview(buildPreviewFromJobResult(jobResult));
  actions.setAnalysisResult(buildAnalysisFromJobResult(jobResult));
  actions.setActiveView("dashboard");
}
