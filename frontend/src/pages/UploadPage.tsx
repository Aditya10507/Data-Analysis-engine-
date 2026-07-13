import { ShowDataPreviewTable } from "../components/DataPreviewTable";
import { ShowFileUploadDropzone } from "../components/FileUploadDropzone";
import { useUploadCompletionRedirect } from "../hooks/useUploadCompletionRedirect";
import { useAppStore } from "../store/appStore";

/** Display and return the upload page shell. */
export function DisplayUploadPage() {
  const parsedPreview = useAppStore((state) => state.parsedPreview);
  useUploadCompletionRedirect();

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header><p className="text-sm font-semibold text-blue-600">NEW ANALYSIS</p><h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">Upload a dataset</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Create a decision-ready report from structured business data. Files are validated, cleaned, profiled, and analysed securely.</p></header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><ShowFileUploadDropzone /></div>
        <aside className="space-y-6 border-l border-slate-200 pl-6 dark:border-slate-800"><ShowUploadGuidance /></aside>
      </div>
      {parsedPreview ? <ShowDataPreviewTable preview={parsedPreview} /> : null}
    </section>
  );
}

/** Show and return concise upload requirements and processing expectations. */
function ShowUploadGuidance() {
  return <><div><h2 className="font-semibold text-slate-950 dark:text-white">Supported data</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">CSV, JSON, TSV, TXT, XLS, and XLSX files up to 1 GB. Every row and column is included in analysis.</p></div><div><h2 className="font-semibold text-slate-950 dark:text-white">What happens next</h2><ol className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300"><li>1. File structure is validated</li><li>2. Cleaning actions are reviewed</li><li>3. Metrics and relationships are calculated</li><li>4. AI insights and reports are prepared</li></ol></div></>;
}
