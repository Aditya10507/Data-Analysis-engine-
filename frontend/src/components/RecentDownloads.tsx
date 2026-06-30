import { Download } from "lucide-react";
import { useAppStore } from "../store/appStore";
import type { DownloadRecord } from "../types/downloads";
import { formatDownloadTime } from "../utils/downloads";

/** Show and return one recent download row. */
function ShowDownloadItem({ record }: { record: DownloadRecord }) {
  return (
    <li className="rounded-md border border-slate-200 p-2 dark:border-slate-800">
      <div className="flex items-start gap-2">
        <Download className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
            {record.label}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {record.filename} / {formatDownloadTime(record.timestamp)}
          </p>
        </div>
      </div>
    </li>
  );
}

/** Show and return the sidebar recent downloads list. */
export function ShowRecentDownloads() {
  const downloadHistory = useAppStore((state) => state.downloadHistory);

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Recent downloads
      </h2>
      <ul className="mt-3 space-y-2">
        {downloadHistory.map((record) => (
          <ShowDownloadItem key={record.id} record={record} />
        ))}
        {!downloadHistory.length ? (
          <li className="text-xs text-slate-500 dark:text-slate-400">No downloads yet.</li>
        ) : null}
      </ul>
    </section>
  );
}
