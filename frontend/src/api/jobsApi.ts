import { jobStatusEnvelopeSchema, uploadEnvelopeSchema } from "../schemas/fileSchemas";
import { cleaningReviewSubmissionSchema } from "../schemas/cleaningReviewSchemas";
import { jobHistoryEnvelopeSchema } from "../schemas/historySchemas";
import type { ApiEnvelope } from "../types/api";
import type { CleaningActionName, JobStatus, UploadJob } from "../types/files";
import type { JobHistoryFilters, JobHistoryResult } from "../types/history";
import { apiClient, requestApi } from "./apiClient";

const JOB_HISTORY_PATH = "/api/v1/jobs";

/** Fetch and return the current backend job status envelope. */
export async function fetchJobStatus(jobId: string): Promise<ApiEnvelope<JobStatus>> {
  try {
    return await requestApi(`/api/v1/jobs/${jobId}/status`, jobStatusEnvelopeSchema);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Job status request failed.");
  }
}

/** Submit cleaning choices and return the queued job envelope. */
export async function submitCleaningReview(jobId: string, choices: CleaningChoice[]): Promise<ApiEnvelope<UploadJob>> {
  try {
    const body = cleaningReviewSubmissionSchema.parse({ choices });
    const response = await apiClient.post(`/api/v1/jobs/${jobId}/cleaning-review`, body);
    return uploadEnvelopeSchema.parse(response.data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Cleaning review submission failed.");
  }
}

export type CleaningChoice = {
  action: CleaningActionName;
  is_enabled: boolean;
};

/** Fetch and return a paginated job history envelope. */
export async function fetchJobHistory(
  limit: number,
  offset: number,
  filters: JobHistoryFilters,
): Promise<ApiEnvelope<JobHistoryResult>> {
  try {
    const params = buildHistoryParams(limit, offset, filters);
    return await requestApi<ApiEnvelope<JobHistoryResult>>(`${JOB_HISTORY_PATH}?${params}`, jobHistoryEnvelopeSchema);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Job history request failed.");
  }
}

/** Build and return job history query parameters. */
function buildHistoryParams(limit: number, offset: number, filters: JobHistoryFilters): URLSearchParams {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  appendOptionalParam(params, "filename", filters.filename);
  appendOptionalParam(params, "start_date", formatStartDate(filters.startDate));
  appendOptionalParam(params, "end_date", formatEndDate(filters.endDate));
  return params;
}

/** Append a query parameter when it has content and return no content. */
function appendOptionalParam(params: URLSearchParams, key: string, value: string): void {
  if (value.trim()) {
    params.set(key, value);
  }
}

/** Format and return a backend start datetime query value. */
function formatStartDate(dateValue: string): string {
  return dateValue ? `${dateValue}T00:00:00` : "";
}

/** Format and return a backend end datetime query value. */
function formatEndDate(dateValue: string): string {
  return dateValue ? `${dateValue}T23:59:59` : "";
}
