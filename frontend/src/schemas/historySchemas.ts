import { z } from "zod";
import { jobResultSchema } from "./jobResultSchemas";

export const jobHistoryFiltersSchema = z.object({
  endDate: z.string(),
  filename: z.string(),
  startDate: z.string(),
}).refine(
  (filters) => !filters.startDate || !filters.endDate || filters.startDate <= filters.endDate,
  "Start date must be before end date.",
);

export const jobHistoryEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.object({
    has_more: z.boolean(),
    items: z.array(z.object({
      column_count: z.number(),
      created_at: z.string(),
      error_msg: z.string().nullable(),
      filename: z.string(),
      job_id: z.string(),
      result_json: jobResultSchema.nullable(),
      row_count: z.number(),
      status: z.enum(["queued", "processing", "done", "failed"]),
    })),
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  }).nullable(),
  error: z.string().nullable(),
});
