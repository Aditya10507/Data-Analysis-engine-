type KpiCardProps = {
  label: string;
  tone: "blue" | "emerald" | "orange" | "violet";
  value: string;
};

const TONE_CLASS: Record<KpiCardProps["tone"], string> = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

/** Show and return one dashboard KPI card. */
export function ShowKpiCard({ label, tone, value }: KpiCardProps) {
  return (
    <article className={`rounded-lg border p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${TONE_CLASS[tone]}`}>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </article>
  );
}
