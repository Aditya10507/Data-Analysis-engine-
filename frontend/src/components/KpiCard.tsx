type KpiCardProps = {
  label: string;
  value: string;
};

/** Show and return one dashboard KPI card. */
export function ShowKpiCard({ label, value }: KpiCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </article>
  );
}
