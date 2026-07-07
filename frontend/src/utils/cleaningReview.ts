import { cleaningReviewResultSchema } from "../schemas/cleaningReviewSchemas";
import type { CleaningChoice } from "../api/jobsApi";
import type { CleaningReviewPlan } from "../types/files";

/** Parse and return a cleaning review plan from backend result JSON. */
export function parseCleaningReview(resultJson: Record<string, unknown> | null): CleaningReviewPlan | null {
  const result = cleaningReviewResultSchema.safeParse(resultJson);
  return result.success ? result.data.cleaning_review : null;
}

/** Build and return cleaning choices from a review plan. */
export function buildCleaningChoices(plan: CleaningReviewPlan): CleaningChoice[] {
  return plan.actions.map((action) => ({
    action: action.action,
    is_enabled: action.is_enabled,
  }));
}
