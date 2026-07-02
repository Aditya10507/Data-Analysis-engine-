import { ClipboardCheck, Lightbulb, TriangleAlert } from "lucide-react";
import type { AnalysisResult } from "../types/analysis";
import type { JobResult } from "../types/files";

const HIGH_RISK_PERCENT = 10;

type ExecutiveSummaryPanelProps = {
  analysisResult: AnalysisResult;
  jobResult: JobResult | null;
};

/** Show and return a natural language executive report summary. */
export function ShowExecutiveSummaryPanel({ analysisResult, jobResult }: ExecutiveSummaryPanelProps) {
  const leadingInsight = jobResult?.insights[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-amber-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Executive summary</h3>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ShowSummaryBlock title="What happened" body={buildWhatHappened(analysisResult, leadingInsight?.headline)} />
        <ShowSummaryBlock title="Why it matters" body={buildWhyItMatters(analysisResult)} />
        <ShowSummaryBlock title="Next step" body={buildNextStep(analysisResult)} />
      </div>
    </section>
  );
}

/** Show and return one executive summary block. */
function ShowSummaryBlock({ body, title }: { body: string; title: string }) {
  const Icon = title === "Next step" ? ClipboardCheck : TriangleAlert;
  return (
    <article className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
      <h4 className="mt-3 font-semibold text-slate-950 dark:text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </article>
  );
}

/** Build and return the what-happened summary. */
function buildWhatHappened(analysisResult: AnalysisResult, headline?: string): string {
  const datasetShape = `${analysisResult.rowCount.toLocaleString()} rows and ${analysisResult.columnCount} columns`;
  return headline ? `${datasetShape} were analyzed. Top signal: ${headline}.` : `${datasetShape} were analyzed and profiled.`;
}

/** Build and return the why-it-matters summary. */
function buildWhyItMatters(analysisResult: AnalysisResult): string {
  const hasRisk = analysisResult.nullPercent > HIGH_RISK_PERCENT || analysisResult.duplicateRowPercent > HIGH_RISK_PERCENT;
  if (hasRisk) {
    return "Data quality issues are large enough to affect decisions, metrics, and AI-generated recommendations.";
  }

  return "The dataset is clean enough for directional analysis, chart exploration, and business review.";
}

/** Build and return the recommended next step. */
function buildNextStep(analysisResult: AnalysisResult): string {
  if (analysisResult.nullPercent > HIGH_RISK_PERCENT) {
    return "Start with the Missing values chart, then inspect columns with the highest null counts.";
  }

  if (analysisResult.correlationCells.length) {
    return "Use the Correlation view to find relationships worth explaining to stakeholders.";
  }

  return "Review the Distribution view and ask the assistant to explain the most important chart.";
}
