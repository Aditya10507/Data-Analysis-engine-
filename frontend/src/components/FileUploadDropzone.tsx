import type { ChangeEvent, DragEvent, ReactElement } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { useFileUpload, type FileUploadController } from "../hooks/useFileUpload";
import { useAppStore } from "../store/appStore";
import { ShowCleaningReviewPanel } from "./CleaningReviewPanel";
import { ShowJobFailurePanel } from "./JobFailurePanel";
import { ShowUploadErrorMessage } from "./UploadErrorMessage";
import { ShowUploadPipelineSteps } from "./UploadPipelineSteps";
import { ShowUploadSuccessPanel } from "./UploadSuccessPanel";
const ACTIVE_STATUSES = new Set(["uploading", "queued", "reviewing", "processing"]);

/** Build and return a drop zone class name. */
function buildDropZoneClass(isDragging: boolean): string {
  const baseClass = "block rounded-lg border border-dashed p-8 text-center transition";
  const activeClass = "border-slate-950 bg-slate-100 dark:border-white dark:bg-slate-800";
  const idleClass = "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900";
  return `${baseClass} ${isDragging ? activeClass : idleClass}`;
}

/** Show and return selected file metadata copy. */
function renderMetadata(upload: FileUploadController): ReactElement {
  if (!upload.filePreview) {
    return <span>Choose a file or drag it here</span>;
  }

  return (
    <span>
      {upload.filePreview.sizeLabel} / {upload.filePreview.rowCount?.toLocaleString() ?? "row count determined during analysis"}
    </span>
  );
}

/** Show and return the upload progress panel. */
function renderProgress(upload: FileUploadController): ReactElement | null {
  if (!upload.uploadedFile) {
    return null;
  }

  return (
    <ShowUploadPipelineSteps progress={upload.progress} status={upload.status} />
  );
}

/** Show and return the upload action button. */
function renderUploadButton(upload: FileUploadController): ReactElement {
  const isProcessing = ACTIVE_STATUSES.has(upload.status);
  const buttonLabel = upload.status === "done" ? "Analysis complete" : upload.status === "reviewing" ? "Review required" : upload.status === "failed" ? "Retry upload" : "Upload and analyse";

  return (
    <button
      className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
      type="button"
      disabled={!upload.uploadedFile || isProcessing || upload.status === "done"}
      onClick={() => void upload.startUpload()}
    >
      {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {buttonLabel}
    </button>
  );
}

/** Select a dropped file and return no content. */
async function handleDrop(
  event: DragEvent<HTMLLabelElement>,
  upload: FileUploadController,
): Promise<void> {
  try {
    event.preventDefault();
    upload.setIsDragging(false);
    const selectedFile = event.dataTransfer.files.item(0);

    if (selectedFile) {
      await upload.selectFile(selectedFile);
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("File drop failed.");
  }
}

/** Select an input file and return no content. */
async function handleChange(
  event: ChangeEvent<HTMLInputElement>,
  upload: FileUploadController,
): Promise<void> {
  try {
    const selectedFile = event.target.files?.item(0);

    if (selectedFile) {
      await upload.selectFile(selectedFile);
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("File selection failed.");
  }
}

/** Show and return the drop zone input area. */
function renderDropZone(upload: FileUploadController): ReactElement {
  return (
    <label
      className={buildDropZoneClass(upload.isDragging)}
      onDragEnter={() => upload.setIsDragging(true)}
      onDragLeave={() => upload.setIsDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => void handleDrop(event, upload)}
    >
      <input
        className="sr-only"
        type="file"
        aria-label="Choose a CSV, JSON, TSV, TXT, XLS, or XLSX file"
        onChange={(event) => void handleChange(event, upload)}
      />
      <FileText className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        {upload.filePreview?.name ?? "Drop CSV, JSON, TSV, TXT, or Excel"}
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {renderMetadata(upload)}
      </p>
    </label>
  );
}

/** Show and return the drag-and-drop file upload component. */
export function ShowFileUploadDropzone() {
  const upload = useFileUpload();
  const cleaningReview = useAppStore((state) => state.cleaningReview);
  const jobId = useAppStore((state) => state.jobId);
  const jobErrorMessage = useAppStore((state) => state.jobErrorMessage);

  return (
    <div className="space-y-5">
      {renderDropZone(upload)}
      {renderProgress(upload)}
      {upload.status === "done" ? <ShowUploadSuccessPanel /> : null}
      {cleaningReview && jobId ? <ShowCleaningReviewPanel jobId={jobId} review={cleaningReview} /> : null}
      {upload.errorMessage ? <ShowUploadErrorMessage errorMessage={upload.errorMessage} /> : null}
      {jobErrorMessage ? (
        <ShowJobFailurePanel errorMessage={jobErrorMessage} onRetry={() => void upload.startUpload()} />
      ) : null}
      {renderUploadButton(upload)}
    </div>
  );
}
