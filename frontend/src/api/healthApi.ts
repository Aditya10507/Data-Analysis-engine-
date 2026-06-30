import { healthEnvelopeSchema } from "../schemas/apiSchemas";
import type { ApiEnvelope, HealthStatus } from "../types/api";
import { requestApi } from "./apiClient";

const HEALTH_PATH = "/health";

/** Fetch and return the backend health status envelope. */
export async function fetchHealthStatus(): Promise<ApiEnvelope<HealthStatus>> {
  try {
    return await requestApi(HEALTH_PATH, healthEnvelopeSchema);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to fetch backend health status.");
  }
}
