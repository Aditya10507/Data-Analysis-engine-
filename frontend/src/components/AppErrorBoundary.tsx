import { AlertTriangle, RotateCcw } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import type { ComponentType, ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

type CompatibleErrorBoundaryProps = {
  children: ReactNode;
  FallbackComponent: ComponentType<ErrorFallbackProps>;
};

const CompatibleErrorBoundary = ErrorBoundary as unknown as ComponentType<CompatibleErrorBoundaryProps>;

/** Show and return the unexpected crash fallback. */
function ShowErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-slate-900">
        <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error.message}</p>
        <button
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          onClick={resetErrorBoundary}
          type="button"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </section>
    </main>
  );
}

/** Wrap and return children with an application error boundary. */
export function CatchAppErrors({ children }: AppErrorBoundaryProps) {
  return (
    <CompatibleErrorBoundary FallbackComponent={ShowErrorFallback}>
      {children}
    </CompatibleErrorBoundary>
  );
}
