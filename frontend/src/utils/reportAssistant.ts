import type { AnalysisResult } from "../types/analysis";
import type { JobResult } from "../types/files";

type ReportAnswerInput = {
  analysisResult: AnalysisResult;
  jobResult: JobResult | null;
  question: string;
};

/** Build and return a report-grounded answer for a user question. */
export function buildReportAnswer(input: ReportAnswerInput): string {
  const question = input.question.toLowerCase();

  if (question.includes("missing") || question.includes("null")) {
    return buildMissingAnswer(input.analysisResult);
  }

  if (question.includes("duplicate")) {
    return `Duplicate rows are ${formatPercent(input.analysisResult.duplicateRowPercent)} of the previewed data. A high duplicate rate can inflate KPIs, so review repeated records before making decisions.`;
  }

  if (question.includes("row") || question.includes("column") || question.includes("shape")) {
    return `This report has ${input.analysisResult.rowCount.toLocaleString()} preview rows and ${input.analysisResult.columnCount.toLocaleString()} columns. ${buildColumnSummary(input.jobResult)}`;
  }

  if (question.includes("insight") || question.includes("recommend")) {
    return buildInsightAnswer(input.jobResult);
  }

  if (question.includes("chart") || question.includes("graph") || question.includes("correlation")) {
    return buildChartAnswer(input.analysisResult);
  }

  return buildOverviewAnswer(input);
}

/** Build and return a missing-data answer. */
function buildMissingAnswer(analysisResult: AnalysisResult): string {
  const highestMissing = findHighestMissingColumn(analysisResult);
  return `Overall missing values are ${formatPercent(analysisResult.nullPercent)}. ${highestMissing} Treat high-missing columns carefully before using them in charts, forecasts, or business conclusions.`;
}

/** Build and return the highest missing column sentence. */
function findHighestMissingColumn(analysisResult: AnalysisResult): string {
  const values = analysisResult.missingValueSeries.values;
  const labels = analysisResult.missingValueSeries.labels;
  const maxValue = Math.max(0, ...values);
  const index = values.indexOf(maxValue);
  return index >= 0 ? `${labels[index]} has the most missing cells (${maxValue}).` : "No missing-value column breakdown is available.";
}

/** Build and return a compact column summary. */
function buildColumnSummary(jobResult: JobResult | null): string {
  if (!jobResult) {
    return "Detailed column metadata is not available for this result.";
  }

  const columnNames = Object.keys(jobResult.column_meta).slice(0, 6);
  return `Key columns include ${columnNames.join(", ")}${columnNames.length === 6 ? ", and more" : ""}.`;
}

/** Build and return an insights answer. */
function buildInsightAnswer(jobResult: JobResult | null): string {
  const insights = jobResult?.insights ?? [];
  if (!insights.length) {
    return "No generated insight cards are available yet. Regenerate insights after the job finishes to get recommendations.";
  }

  return insights.slice(0, 3).map((insight) => `${insight.headline}: ${insight.body}`).join("\n\n");
}

/** Build and return a chart guidance answer. */
function buildChartAnswer(analysisResult: AnalysisResult): string {
  const histogramCount = analysisResult.histogramSeries.length;
  const trendCount = analysisResult.trendSeries.length;
  const correlationCount = analysisResult.correlationCells.length;
  return `The dashboard has ${histogramCount} distribution chart(s), ${trendCount} trend series, and ${correlationCount} correlation cell(s). Use distributions for outliers, trends for row-order movement, and correlations for relationships between numeric columns.`;
}

/** Build and return a general overview answer. */
function buildOverviewAnswer(input: ReportAnswerInput): string {
  const rowCount = input.analysisResult.rowCount.toLocaleString();
  const nullPercent = formatPercent(input.analysisResult.nullPercent);
  const duplicatePercent = formatPercent(input.analysisResult.duplicateRowPercent);
  return `Quick read: ${rowCount} preview rows, ${input.analysisResult.columnCount} columns, ${nullPercent} missing values, and ${duplicatePercent} duplicate rows. Ask about missing values, duplicates, columns, charts, or recommendations for a focused answer.`;
}

/** Format and return a percent label. */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
