import { ClipboardCopy, Download, FileText } from "lucide-react";
import { downloadBlob, downloadReportPdf, downloadUrl } from "../api/exportApi";
import { useAppStore } from "../store/appStore";
import { useToastStore } from "../store/toastStore";
import type { DownloadRecord } from "../types/downloads";
import type { JobResult } from "../types/files";
import type { ToastKind } from "../types/toast";
import { buildDownloadRecord } from "../utils/downloads";
import { buildInsightsMarkdown } from "../utils/insightMarkdown";

type ExportAction = {
  icon: typeof Download;
  label: string;
  onClick: () => void;
};

type AddDownloadRecord = (record: DownloadRecord) => void;
type AddToast = (toast: { kind: ToastKind; message: string; title: string }) => void;

/** Show and return dashboard export controls. */
export function ShowDashboardExportControls() {
  const jobResult = useAppStore((state) => state.jobResult);
  const addDownloadRecord = useAppStore((state) => state.addDownloadRecord);
  const addToast = useToastStore((state) => state.addToast);

  if (!jobResult) {
    return null;
  }

  const actions = buildExportActions(jobResult, addDownloadRecord, addToast);
  return (
    <section className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {actions.map((action) => (
        <ShowExportButton key={action.label} action={action} />
      ))}
    </section>
  );
}

/** Build and return dashboard export action configs. */
function buildExportActions(
  jobResult: JobResult,
  addDownloadRecord: AddDownloadRecord,
  addToast: AddToast,
): ExportAction[] {
  return [
    buildCleanedCsvAction(jobResult, addDownloadRecord),
    buildPdfAction(jobResult, addDownloadRecord, addToast),
    buildCopyInsightsAction(jobResult, addDownloadRecord, addToast),
  ];
}

/** Build and return the cleaned CSV export action. */
function buildCleanedCsvAction(jobResult: JobResult, addDownloadRecord: AddDownloadRecord): ExportAction {
  return {
    icon: Download,
    label: "Download cleaned CSV",
    onClick: () => {
      downloadUrl(jobResult.download_urls.cleaned_csv, `${jobResult.filename}.cleaned.csv`);
      addDownloadRecord(buildDownloadRecord("cleaned_csv", jobResult.filename, "Cleaned CSV"));
    },
  };
}

/** Build and return the PDF export action. */
function buildPdfAction(jobResult: JobResult, addDownloadRecord: AddDownloadRecord, addToast: AddToast): ExportAction {
  return {
    icon: FileText,
    label: "Export report as PDF",
    onClick: () => void exportPdf(jobResult, addDownloadRecord, addToast),
  };
}

/** Build and return the copy-insights export action. */
function buildCopyInsightsAction(jobResult: JobResult, addDownloadRecord: AddDownloadRecord, addToast: AddToast): ExportAction {
  return {
    icon: ClipboardCopy,
    label: "Copy insights",
    onClick: () => void copyInsights(jobResult, addDownloadRecord, addToast),
  };
}

/** Export a PDF report and return no content. */
async function exportPdf(jobResult: JobResult, addDownloadRecord: AddDownloadRecord, addToast: AddToast): Promise<void> {
  try {
    const pdfBlob = await downloadReportPdf(jobResult.job_id);
    downloadBlob(pdfBlob, `${jobResult.filename}.report.pdf`);
    addDownloadRecord(buildDownloadRecord("pdf_report", jobResult.filename, "PDF report"));
    addToast({ kind: "success", message: "PDF report is downloading.", title: "Export ready" });
  } catch (error) {
    showExportError(error, addToast);
  }
}

/** Copy insight markdown and return no content. */
async function copyInsights(jobResult: JobResult, addDownloadRecord: AddDownloadRecord, addToast: AddToast): Promise<void> {
  try {
    await navigator.clipboard.writeText(buildInsightsMarkdown(jobResult.insights));
    addDownloadRecord(buildDownloadRecord("insights_markdown", jobResult.filename, "Insights copied"));
    addToast({ kind: "success", message: "Insights copied as markdown.", title: "Copied" });
  } catch (error) {
    showExportError(error, addToast);
  }
}

/** Surface export errors to the user and return no content. */
function showExportError(error: unknown, addToast: AddToast): void {
  const message = error instanceof Error ? error.message : "Export failed.";
  addToast({ kind: "error", message, title: "Export failed" });
}

/** Show and return one export button. */
function ShowExportButton({ action }: { action: ExportAction }) {
  const Icon = action.icon;
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      onClick={action.onClick}
      type="button"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </button>
  );
}
