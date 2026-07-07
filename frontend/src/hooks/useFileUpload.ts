import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useAppStore } from "../store/appStore";
import type { AnalysisStatus } from "../types/app";
import {
  buildUploadController,
  INITIAL_UPLOAD_STATE,
  pollJobStatus,
  type FileUploadController,
  type FileUploadState,
  type StoreActions,
} from "./fileUploadActions";
import { PROGRESS_BY_STATUS } from "./uploadProgress";

const POLL_INTERVAL_MS = 2000;

export type { FileUploadController };

/** Poll job status while work is active and return no content. */
function useJobStatusPolling(
  jobId: string | null,
  status: AnalysisStatus,
  actions: StoreActions,
  setUploadState: Dispatch<SetStateAction<FileUploadState>>,
): void {
  useEffect(() => {
    if (!jobId || status === "reviewing" || status === "done" || status === "failed") {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      void pollJobStatus(jobId, actions, setUploadState);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [actions, jobId, setUploadState, status]);
}

/** Manage and return file upload actions and state. */
export function useFileUpload(): FileUploadController {
  const [uploadState, setUploadState] = useState(INITIAL_UPLOAD_STATE);
  const jobId = useAppStore((state) => state.jobId);
  const status = useAppStore((state) => state.status);
  const storeActions = useUploadStoreActions(status);

  useJobStatusPolling(jobId, status, storeActions, setUploadState);

  useEffect(() => {
    setUploadState((state) => ({ ...state, progress: PROGRESS_BY_STATUS[status] }));
  }, [status]);

  return buildUploadController(uploadState, setUploadState, storeActions);
}

/** Read store functions and return a stable upload action bundle. */
function useUploadStoreActions(status: AnalysisStatus): StoreActions {
  const uploadedFile = useAppStore((state) => state.uploadedFile);
  const setAnalysisResult = useAppStore((state) => state.setAnalysisResult);
  const setCleaningReview = useAppStore((state) => state.setCleaningReview);
  const setJobErrorMessage = useAppStore((state) => state.setJobErrorMessage);
  const setJobId = useAppStore((state) => state.setJobId);
  const setJobResult = useAppStore((state) => state.setJobResult);
  const setParsedPreview = useAppStore((state) => state.setParsedPreview);
  const setStatus = useAppStore((state) => state.setStatus);
  const setUploadedFile = useAppStore((state) => state.setUploadedFile);
  return useMemo<StoreActions>(() => ({
    setAnalysisResult,
    setCleaningReview,
    setJobErrorMessage,
    setJobId,
    setJobResult,
    setParsedPreview,
    setStatus,
    setUploadedFile,
    status,
    uploadedFile,
  }), [
    setAnalysisResult,
    setCleaningReview,
    setJobErrorMessage,
    setJobId,
    setJobResult,
    setParsedPreview,
    setStatus,
    setUploadedFile,
    status, uploadedFile,
  ]);
}
