import type { Dispatch, SetStateAction } from "react";
import { uploadFile } from "../api/filesApi";
import { fetchJobStatus } from "../api/jobsApi";
import { selectedFileSchema } from "../schemas/fileSchemas";
import type { AnalysisStatus } from "../types/app";
import type { AnalysisResult } from "../types/analysis";
import type { FilePreview, JobResult, ParsedFilePreview } from "../types/files";
import { formatFileSelectionError, formatJobFailure } from "../utils/uploadErrors";
import { buildFilePreview } from "./filePreview";
import { applyJobResult } from "./jobResultActions";

export type FileUploadState = {
  errorMessage: string | null;
  filePreview: FilePreview | null;
  isDragging: boolean;
  progress: number;
};

export type StoreActions = {
  setAnalysisResult: (analysisResult: AnalysisResult | null) => void;
  setJobErrorMessage: (jobErrorMessage: string | null) => void;
  setJobId: (jobId: string | null) => void;
  setJobResult: (jobResult: JobResult | null) => void;
  setParsedPreview: (parsedPreview: ParsedFilePreview | null) => void;
  setStatus: (status: AnalysisStatus) => void;
  setUploadedFile: (uploadedFile: File | null) => void;
  status: AnalysisStatus;
  uploadedFile: File | null;
};

export type FileUploadController = FileUploadState & {
  selectFile: (file: File) => Promise<void>;
  setIsDragging: (isDragging: boolean) => void;
  startUpload: () => Promise<void>;
  status: AnalysisStatus;
  uploadedFile: File | null;
};

export const INITIAL_UPLOAD_STATE: FileUploadState = {
  errorMessage: null,
  filePreview: null,
  isDragging: false,
  progress: 0,
};

export const PROGRESS_BY_STATUS: Record<AnalysisStatus, number> = {
  idle: 0,
  uploading: 25,
  queued: 50,
  processing: 75,
  done: 100,
  failed: 100,
};

/** Poll the backend job and return no content. */
export async function pollJobStatus(
  jobId: string,
  actions: StoreActions,
  setUploadState: Dispatch<SetStateAction<FileUploadState>>,
): Promise<void> {
  try {
    const envelope = await fetchJobStatus(jobId);
    const jobStatus = envelope.data?.status ?? "failed";
    actions.setStatus(jobStatus);
    actions.setJobErrorMessage(readJobErrorMessage(envelope.data?.error_msg ?? null, jobStatus));
    applyJobResult(envelope.data ?? null, actions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Job status polling failed.";
    actions.setStatus("failed");
    actions.setJobErrorMessage(errorMessage);
    setUploadState((state) => ({ ...state, errorMessage }));
  }
}

/** Build and return the upload controller for UI components. */
export function buildUploadController(
  uploadState: FileUploadState,
  setUploadState: Dispatch<SetStateAction<FileUploadState>>,
  actions: StoreActions,
): FileUploadController {
  return {
    ...uploadState,
    selectFile: (file) => selectFile(file, setUploadState, actions),
    setIsDragging: (isDragging) => setUploadState((state) => ({ ...state, isDragging })),
    startUpload: () => startUpload(setUploadState, actions),
    status: actions.status,
    uploadedFile: actions.uploadedFile,
  };
}

/** Select a file and return no content after previewing metadata. */
async function selectFile(
  file: File,
  setUploadState: Dispatch<SetStateAction<FileUploadState>>,
  actions: StoreActions,
): Promise<void> {
  try {
    selectedFileSchema.parse(file);
    actions.setUploadedFile(file);
    actions.setStatus("idle");
    actions.setAnalysisResult(null);
    actions.setJobErrorMessage(null);
    actions.setJobId(null);
    actions.setJobResult(null);
    actions.setParsedPreview(null);
    setUploadState({ ...INITIAL_UPLOAD_STATE, filePreview: await buildFilePreview(file) });
  } catch (error) {
    const errorMessage = formatFileSelectionError(error);
    setUploadState({ ...INITIAL_UPLOAD_STATE, errorMessage });
  }
}

/** Upload the selected file and return no content. */
async function startUpload(
  setUploadState: Dispatch<SetStateAction<FileUploadState>>,
  actions: StoreActions,
): Promise<void> {
  try {
    if (!actions.uploadedFile) {
      throw new Error("Select a file before uploading.");
    }

    actions.setStatus("uploading");
    actions.setJobErrorMessage(null);
    actions.setJobResult(null);
    const envelope = await uploadFile(actions.uploadedFile);
    actions.setJobId(envelope.data?.job_id ?? null);
    actions.setStatus(envelope.data?.status ?? "failed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Upload failed.";
    actions.setStatus("failed");
    actions.setJobErrorMessage(errorMessage);
    setUploadState((state) => ({ ...state, errorMessage }));
  }
}

/** Read and return a formatted job error when the job failed. */
function readJobErrorMessage(errorMessage: string | null, status: AnalysisStatus): string | null {
  return status === "failed" ? formatJobFailure(errorMessage) : null;
}
