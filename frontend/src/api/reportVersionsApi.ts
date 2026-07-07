import { reportVersionEnvelopeSchema } from "../schemas/reportVersionSchemas";
import type { ApiEnvelope } from "../types/api";
import type { ReportVersionList } from "../types/reportVersions";
import { requestApi } from "./apiClient";

/** Fetch and return saved report versions for one job. */
export async function fetchReportVersions(jobId: string): Promise<ApiEnvelope<ReportVersionList>> {
  try {
    return await requestApi(`/api/v1/jobs/${jobId}/versions`, reportVersionEnvelopeSchema);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Report versions request failed.");
  }
}
