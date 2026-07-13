import { CheckCircle2 } from "lucide-react";

/** Show and return upload completion confirmation before dashboard navigation. */
export function ShowUploadSuccessPanel() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950" role="status">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
      <div><p className="font-semibold">Upload and analysis completed</p><p className="mt-1 text-sm text-emerald-800">Your report is ready. Opening the business dashboard...</p></div>
    </div>
  );
}
