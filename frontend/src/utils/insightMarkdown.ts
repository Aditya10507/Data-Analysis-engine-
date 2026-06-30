import type { JobResultInsight } from "../types/files";

/** Build and return markdown text for all insights. */
export function buildInsightsMarkdown(insights: JobResultInsight[]): string {
  if (!insights.length) {
    return "## AI Insights\n\nNo insights available.";
  }

  return [
    "## AI Insights",
    ...insights.map(formatInsightMarkdown),
  ].join("\n\n");
}

/** Format and return one insight as markdown. */
function formatInsightMarkdown(insight: JobResultInsight): string {
  return `### ${insight.headline}\n\n**Type:** ${insight.type}\n\n${insight.body}`;
}
