import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { InsightCard, InsightKind } from "../types/insights";

type AiInsightCardProps = {
  hasCursor: boolean;
  insight: InsightCard;
};

const ICONS: Record<InsightKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  info: Info,
  trend: TrendingUp,
  warning: AlertTriangle,
};

/** Show and return one AI insight card. */
export function ShowAiInsightCard({ hasCursor, insight }: AiInsightCardProps) {
  const Icon = ICONS[insight.kind];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <Icon className="mt-1 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-300" aria-hidden="true" />
        <div>
          <h4 className="font-semibold text-slate-950 dark:text-white">{insight.headline}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {insight.body}
            {hasCursor ? <span className="ml-1 animate-pulse">|</span> : null}
          </p>
        </div>
      </div>
    </article>
  );
}
