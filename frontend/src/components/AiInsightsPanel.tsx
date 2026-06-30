import { useEffect, useRef } from "react";
import { useInsightStream } from "../hooks/useInsightStream";
import type { InsightCard } from "../types/insights";
import { ShowAiInsightCard } from "./AiInsightCard";

type PanelHeaderProps = {
  isStreaming: boolean;
  onRegenerate: () => void;
};

/** Show and return the AI insight panel header. */
function renderPanelHeader({ isStreaming, onRegenerate }: PanelHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">AI Insights</h3>
      <button
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
        type="button"
        disabled={isStreaming}
        onClick={onRegenerate}
      >
        Regenerate insights
      </button>
    </div>
  );
}

/** Show and return streamed insight cards. */
function renderInsightCards(insights: InsightCard[], isStreaming: boolean) {
  const lastInsightIndex = insights.length - 1;

  return (
    <div className="mt-5 grid gap-4">
      {insights.map((insight, index) => (
        <ShowAiInsightCard
          key={insight.id}
          hasCursor={isStreaming && index === lastInsightIndex}
          insight={insight}
        />
      ))}
    </div>
  );
}

/** Show and return the streamed AI insights panel. */
export function ShowAiInsightsPanel() {
  const hasRequestedRef = useRef(false);
  const insightStream = useInsightStream();

  useEffect(() => {
    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      void insightStream.regenerateInsights();
    }
  }, [insightStream]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      {renderPanelHeader({
        isStreaming: insightStream.isStreaming,
        onRegenerate: () => void insightStream.regenerateInsights(),
      })}
      {renderInsightCards(insightStream.insights, insightStream.isStreaming)}
      {insightStream.errorMessage ? renderStreamError(insightStream.errorMessage) : null}
    </section>
  );
}

/** Show and return an insight stream error. */
function renderStreamError(errorMessage: string) {
  return (
    <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-300">
      {errorMessage}
    </p>
  );
}
