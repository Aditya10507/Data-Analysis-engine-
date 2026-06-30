import { useState } from "react";
import { streamInsightEvents } from "../api/insightsApi";
import type { InsightCard, InsightStreamEvent } from "../types/insights";
import { applyInsightEvent } from "../utils/insightStreamReducer";

type InsightStreamState = {
  errorMessage: string | null;
  insights: InsightCard[];
  isStreaming: boolean;
};

const INITIAL_STREAM_STATE: InsightStreamState = {
  errorMessage: null,
  insights: [],
  isStreaming: false,
};

/** Manage and return streamed AI insight state. */
export function useInsightStream() {
  const [streamState, setStreamState] = useState(INITIAL_STREAM_STATE);

  /** Regenerate insights and return no content after streaming finishes. */
  async function regenerateInsights(): Promise<void> {
    try {
      setStreamState({ ...INITIAL_STREAM_STATE, isStreaming: true });
      await streamInsightEvents(handleInsightEvent);
      setStreamState((state) => ({ ...state, isStreaming: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Insight streaming failed.";
      setStreamState((state) => ({ ...state, errorMessage, isStreaming: false }));
    }
  }

  /** Apply one streamed insight event and return no content. */
  function handleInsightEvent(event: InsightStreamEvent): void {
    if (event.event === "done") {
      setStreamState((state) => ({ ...state, isStreaming: false }));
      return;
    }

    setStreamState((state) => ({
      ...state,
      insights: applyInsightEvent(state.insights, event),
    }));
  }

  return { ...streamState, regenerateInsights };
}
