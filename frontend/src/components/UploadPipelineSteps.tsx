import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import type { AnalysisStatus } from "../types/app";

const MAX_PROGRESS_VALUE = 100;

type UploadPipelineStepsProps = {
  progress: number;
  status: AnalysisStatus;
};

type PipelineStep = {
  label: string;
  status: AnalysisStatus[];
};

const PIPELINE_STEPS: PipelineStep[] = [
  { label: "Uploading", status: ["uploading"] },
  { label: "Parsing", status: ["queued"] },
  { label: "Cleaning review", status: ["reviewing"] },
  { label: "Cleaning", status: ["processing"] },
  { label: "Profiling", status: ["processing"] },
  { label: "AI insights", status: ["processing"] },
  { label: "Done", status: ["done"] },
];

/** Show and return the upload processing timeline. */
export function ShowUploadPipelineSteps({ progress, status }: UploadPipelineStepsProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <progress className="h-2 w-full overflow-hidden rounded-full accent-blue-600" max={MAX_PROGRESS_VALUE} value={progress} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PIPELINE_STEPS.map((step) => (
          <ShowPipelineStep key={step.label} step={step} currentStatus={status} />
        ))}
      </div>
    </div>
  );
}

/** Show and return one pipeline step. */
function ShowPipelineStep({ currentStatus, step }: { currentStatus: AnalysisStatus; step: PipelineStep }) {
  const state = readStepState(step, currentStatus);
  const Icon = state === "done" ? CheckCircle2 : state === "active" ? LoaderCircle : Circle;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-4 w-4 ${state === "active" ? "animate-spin text-blue-600" : "text-slate-400"}`} aria-hidden="true" />
      <span className={state === "idle" ? "text-slate-500" : "font-semibold text-slate-800 dark:text-slate-100"}>
        {step.label}
      </span>
    </div>
  );
}

/** Read and return the visual state for a pipeline step. */
function readStepState(step: PipelineStep, currentStatus: AnalysisStatus): "active" | "done" | "idle" {
  if (currentStatus === "done") {
    return "done";
  }

  if (step.status.includes(currentStatus)) {
    return "active";
  }

  return "idle";
}
