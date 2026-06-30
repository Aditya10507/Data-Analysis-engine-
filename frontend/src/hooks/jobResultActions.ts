import type { JobStatus } from "../types/files";
import {
  buildAnalysisFromJobResult,
  buildPreviewFromJobResult,
  parseJobResult,
} from "../utils/jobResult";
import type { StoreActions } from "./fileUploadActions";

/** Apply and return no content for a completed job result. */
export function applyJobResult(jobStatus: JobStatus | null, actions: StoreActions): void {
  if (jobStatus?.status !== "done") {
    return;
  }

  const jobResult = parseJobResult(jobStatus.result_json);
  if (!jobResult) {
    return;
  }

  actions.setJobResult(jobResult);
  actions.setParsedPreview(buildPreviewFromJobResult(jobResult));
  actions.setAnalysisResult(buildAnalysisFromJobResult(jobResult));
}
