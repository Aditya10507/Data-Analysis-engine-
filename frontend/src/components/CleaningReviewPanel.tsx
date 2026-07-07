import { useState, type Dispatch, type SetStateAction } from "react";
import { CheckCircle2, LoaderCircle, SlidersHorizontal } from "lucide-react";
import { submitCleaningReview, type CleaningChoice } from "../api/jobsApi";
import { useAppStore } from "../store/appStore";
import type { AnalysisStatus } from "../types/app";
import type { CleaningActionName, CleaningReviewAction, CleaningReviewPlan } from "../types/files";

type CleaningReviewPanelProps = {
  jobId: string;
  review: CleaningReviewPlan;
};

/** Show and return the cleaning approval panel. */
export function ShowCleaningReviewPanel({ jobId, review }: CleaningReviewPanelProps) {
  const [choices, setChoices] = useState<Record<CleaningActionName, boolean>>(() => buildChoiceMap(review));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setCleaningReview = useAppStore((state) => state.setCleaningReview);
  const setJobErrorMessage = useAppStore((state) => state.setJobErrorMessage);
  const setStatus = useAppStore((state) => state.setStatus);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <SlidersHorizontal className="mt-1 h-5 w-5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
        <div>
          <h4 className="text-base font-semibold text-slate-950 dark:text-white">Review cleaning actions</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Approve the cleaning steps before analysis starts on {review.initial_rows.toLocaleString()} rows.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {review.actions.map((action) => (
          <ShowCleaningActionRow key={action.action} action={action} isEnabled={choices[action.action]} onToggle={(actionName) => toggleChoice(actionName, setChoices)} />
        ))}
      </div>
      {errorMessage ? <p className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">{errorMessage}</p> : null}
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        disabled={isSubmitting}
        onClick={() => void submitReview(jobId, review, choices, setIsSubmitting, setErrorMessage, setCleaningReview, setJobErrorMessage, setStatus)}
      >
        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        Run analysis
      </button>
    </div>
  );
}

/** Show and return one cleaning action toggle row. */
function ShowCleaningActionRow(props: { action: CleaningReviewAction; isEnabled: boolean; onToggle: (action: CleaningActionName) => void }) {
  const { action, isEnabled, onToggle } = props;
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-white bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span>
        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{action.label}</span>
        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{action.description}</span>
        <span className="mt-2 block text-xs font-semibold text-amber-700 dark:text-amber-300">
          {action.row_count.toLocaleString()} rows / {action.column_count.toLocaleString()} columns affected
        </span>
      </span>
      <input className="mt-1 h-5 w-5 accent-amber-600" type="checkbox" checked={isEnabled} onChange={() => onToggle(action.action)} />
    </label>
  );
}

/** Toggle and return no content for one cleaning choice. */
function toggleChoice(action: CleaningActionName, setChoices: Dispatch<SetStateAction<Record<CleaningActionName, boolean>>>): void {
  setChoices((choices) => ({ ...choices, [action]: !choices[action] }));
}

/** Build and return the default choice map from a review plan. */
function buildChoiceMap(review: CleaningReviewPlan): Record<CleaningActionName, boolean> {
  return Object.fromEntries(review.actions.map((action) => [action.action, action.is_enabled])) as Record<CleaningActionName, boolean>;
}

/** Submit the review choices and return no content. */
async function submitReview(jobId: string, review: CleaningReviewPlan, choices: Record<CleaningActionName, boolean>, setIsSubmitting: (isSubmitting: boolean) => void, setErrorMessage: (message: string | null) => void, setCleaningReview: (review: CleaningReviewPlan | null) => void, setJobErrorMessage: (message: string | null) => void, setStatus: (status: AnalysisStatus) => void): Promise<void> {
  try {
    setIsSubmitting(true);
    const envelope = await submitCleaningReview(jobId, buildChoices(review, choices));
    setCleaningReview(null);
    setJobErrorMessage(null);
    setStatus(envelope.data?.status ?? "failed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleaning review failed.";
    setErrorMessage(message);
  } finally {
    setIsSubmitting(false);
  }
}

/** Build and return API choices from local state. */
function buildChoices(review: CleaningReviewPlan, choices: Record<CleaningActionName, boolean>): CleaningChoice[] {
  return review.actions.map((action) => ({ action: action.action, is_enabled: choices[action.action] }));
}
