import { z } from "zod";

export const cleaningActionSchema = z.enum(["fill_nulls", "remove_duplicates", "clip_outliers", "parse_dates"]);

export const cleaningReviewActionSchema = z.object({
  action: cleaningActionSchema,
  column_count: z.number().nonnegative(),
  description: z.string().min(1),
  is_enabled: z.boolean(),
  label: z.string().min(1),
  row_count: z.number().nonnegative(),
});

export const cleaningReviewPlanSchema = z.object({
  actions: z.array(cleaningReviewActionSchema),
  initial_rows: z.number().nonnegative(),
});

export const cleaningReviewResultSchema = z.object({
  cleaning_review: cleaningReviewPlanSchema,
});

export const cleaningReviewSubmissionSchema = z.object({
  choices: z.array(
    z.object({
      action: cleaningActionSchema,
      is_enabled: z.boolean(),
    }),
  ).min(1),
});
