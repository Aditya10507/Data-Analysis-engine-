import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { DataQualityScore } from "../types/files";

type DataQualityBadgeProps = {
  dataQuality: DataQualityScore | null;
};

/** Show and return the data quality score badge. */
export function ShowDataQualityBadge({ dataQuality }: DataQualityBadgeProps) {
  if (!dataQuality) {
    return <ShowPendingQualityBadge />;
  }

  const quality = dataQuality;
  const Icon = quality.score >= 75 ? ShieldCheck : ShieldAlert;
  return (
    <div className={`rounded-lg border px-4 py-3 ${buildToneClass(quality.score)}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">Data Quality</p>
          <p className="text-2xl font-semibold">{quality.score}/100 <span className="text-base">Grade {quality.grade}</span></p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quality.issues.slice(0, 4).map((issue) => (
          <span key={`${issue.label}-${issue.value}`} className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold dark:bg-slate-950/60">
            {issue.label}: {issue.value}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Show and return the pending score badge for older reports. */
function ShowPendingQualityBadge() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">Data Quality</p>
          <p className="text-lg font-semibold">Not scored yet</p>
        </div>
      </div>
    </div>
  );
}

/** Build and return score tone classes. */
function buildToneClass(score: number): string {
  if (score >= 85) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  }

  if (score >= 70) {
    return "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  }

  return "border-red-100 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
}
