import { BarChart3, LineChart, Network, SearchCheck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { AnalysisResult } from "../types/analysis";
import type { ChartTab } from "./ChartPanel";

const MAX_RECOMMENDATIONS = 3;
const MANY_COLUMNS_THRESHOLD = 6;

type SmartChartRecommendationsProps = {
  analysisResult: AnalysisResult;
  onSelectChart: (chartTab: ChartTab) => void;
};

type ChartRecommendation = {
  body: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  tone: string;
  value: ChartTab;
};

/** Show and return smart chart recommendations. */
export function ShowSmartChartRecommendations({ analysisResult, onSelectChart }: SmartChartRecommendationsProps) {
  const recommendations = buildRecommendations(analysisResult).slice(0, MAX_RECOMMENDATIONS);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <SearchCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Recommended views</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Start with these charts for the fastest read.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {recommendations.map((recommendation) => (
          <ShowRecommendationCard key={recommendation.label} onSelectChart={onSelectChart} recommendation={recommendation} />
        ))}
      </div>
    </section>
  );
}

/** Show and return one chart recommendation. */
function ShowRecommendationCard(props: { onSelectChart: (chartTab: ChartTab) => void; recommendation: ChartRecommendation }) {
  const { onSelectChart, recommendation } = props;
  const Icon = recommendation.icon;
  return (
    <button className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${recommendation.tone}`} type="button" onClick={() => onSelectChart(recommendation.value)}>
      <Icon className="h-5 w-5" aria-hidden="true" />
      <h4 className="mt-3 font-semibold text-slate-950 dark:text-white">{recommendation.label}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{recommendation.body}</p>
    </button>
  );
}

/** Build and return recommended chart views. */
function buildRecommendations(analysisResult: AnalysisResult): ChartRecommendation[] {
  const recommendations = [
    buildDistributionRecommendation(analysisResult),
    buildMissingRecommendation(analysisResult),
  ];

  if (analysisResult.correlationCells.length && analysisResult.columnCount >= MANY_COLUMNS_THRESHOLD) {
    recommendations.unshift(buildCorrelationRecommendation());
  }

  if (analysisResult.trendSeries.length) {
    recommendations.push(buildTrendRecommendation());
  }

  return recommendations;
}

/** Build and return a distribution recommendation. */
function buildDistributionRecommendation(analysisResult: AnalysisResult): ChartRecommendation {
  return {
    body: `${analysisResult.histogramSeries.length} numeric column(s) can reveal outliers, skew, and value concentration.`,
    icon: BarChart3,
    label: "Distribution",
    tone: "border-blue-100 bg-blue-50/60 text-blue-700 dark:border-slate-800 dark:bg-slate-950",
    value: "distribution",
  };
}

/** Build and return a missing-values recommendation. */
function buildMissingRecommendation(analysisResult: AnalysisResult): ChartRecommendation {
  return {
    body: `${analysisResult.nullPercent.toFixed(1)}% missing cells detected. Review this before trusting downstream insights.`,
    icon: SearchCheck,
    label: "Missing values",
    tone: "border-orange-100 bg-orange-50/60 text-orange-700 dark:border-slate-800 dark:bg-slate-950",
    value: "missing",
  };
}

/** Build and return a correlation recommendation. */
function buildCorrelationRecommendation(): ChartRecommendation {
  return {
    body: "Many numeric columns are present, so relationships between fields are worth checking early.",
    icon: Network,
    label: "Correlation",
    tone: "border-violet-100 bg-violet-50/60 text-violet-700 dark:border-slate-800 dark:bg-slate-950",
    value: "correlation",
  };
}

/** Build and return a trend recommendation. */
function buildTrendRecommendation(): ChartRecommendation {
  return {
    body: "Trend lines can show row-order shifts and potential changes across the uploaded records.",
    icon: LineChart,
    label: "Trends",
    tone: "border-emerald-100 bg-emerald-50/60 text-emerald-700 dark:border-slate-800 dark:bg-slate-950",
    value: "trends",
  };
}
