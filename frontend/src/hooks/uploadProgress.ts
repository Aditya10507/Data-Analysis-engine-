import type { Dispatch, SetStateAction } from "react";
import type { AnalysisStatus } from "../types/app";
import type { FileUploadState } from "./fileUploadActions";

export const PROGRESS_BY_STATUS: Record<AnalysisStatus, number> = {
  idle: 0,
  uploading: 15,
  queued: 60,
  reviewing: 60,
  processing: 80,
  done: 100,
  failed: 100,
};

/** Build and return a real upload progress handler. */
export function buildProgressHandler(setUploadState: Dispatch<SetStateAction<FileUploadState>>) {
  return (loadedBytes: number, totalBytes: number) => {
    const ratio = totalBytes > 0 ? loadedBytes / totalBytes : 0;
    const progress = Math.min(45, Math.max(15, Math.round(ratio * 45)));
    setUploadState((state) => ({ ...state, progress }));
  };
}
