import { insightStreamEventSchema } from "../schemas/insightSchemas";
import type { InsightStreamEvent } from "../types/insights";
import { streamApi } from "./apiClient";

const INSIGHT_STREAM_PATH = "/api/v1/insights/stream";

/** Stream and return parsed insight events through the callback. */
export async function streamInsightEvents(
  onEvent: (event: InsightStreamEvent) => void,
): Promise<void> {
  try {
    await streamApi(INSIGHT_STREAM_PATH, (message) => {
      const parsedMessage: unknown = JSON.parse(message);
      onEvent(insightStreamEventSchema.parse(parsedMessage));
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Insight streaming failed.");
  }
}
