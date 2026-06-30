import type { InsightCard, InsightStreamEvent } from "../types/insights";

/** Apply and return insight cards after one stream event. */
export function applyInsightEvent(
  insights: InsightCard[],
  event: InsightStreamEvent,
): InsightCard[] {
  if (event.event === "start") {
    return appendInsight(insights, event);
  }

  if (event.event === "chunk") {
    return appendInsightChunk(insights, event);
  }

  return insights;
}

/** Append and return a new insight card from a start event. */
function appendInsight(insights: InsightCard[], event: InsightStreamEvent): InsightCard[] {
  if (!event.id || !event.kind || !event.headline) {
    return insights;
  }

  return [...insights, { body: "", headline: event.headline, id: event.id, kind: event.kind }];
}

/** Append and return an updated insight body from a chunk event. */
function appendInsightChunk(insights: InsightCard[], event: InsightStreamEvent): InsightCard[] {
  if (!event.id || !event.body) {
    return insights;
  }

  return insights.map((insight) => (
    insight.id === event.id ? { ...insight, body: `${insight.body}${event.body}` } : insight
  ));
}
