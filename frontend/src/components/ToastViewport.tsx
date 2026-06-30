import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "../store/toastStore";
import type { ToastKind, ToastMessage } from "../types/toast";

const TOAST_ICON_CLASS = "h-5 w-5 shrink-0";

/** Resolve and return the icon for a toast kind. */
function renderToastIcon(kind: ToastKind) {
  if (kind === "success") {
    return <CheckCircle2 className={`${TOAST_ICON_CLASS} text-emerald-500`} aria-hidden="true" />;
  }

  if (kind === "info") {
    return <Info className={`${TOAST_ICON_CLASS} text-blue-500`} aria-hidden="true" />;
  }

  return <AlertCircle className={`${TOAST_ICON_CLASS} text-red-500`} aria-hidden="true" />;
}

/** Render and return a single toast message. */
function ShowToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <li className="flex w-80 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      {renderToastIcon(toast.kind)}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">{toast.title}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.message}</p>
      </div>
      <button
        aria-label="Dismiss notification"
        className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
        onClick={() => removeToast(toast.id)}
        type="button"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Show and return the toast notification viewport. */
export function ShowToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <ol className="fixed right-4 top-4 z-50 space-y-3" aria-live="polite">
      {toasts.map((toast) => (
        <ShowToastItem key={toast.id} toast={toast} />
      ))}
    </ol>
  );
}
