import { z } from "zod";
import type { JobResult } from "../types/files";
import type { ApiEnvelope } from "../types/api";
import type { JobHistoryResult } from "../types/history";
import { jobResultSchema } from "./jobResultSchemas";

const historyJobResultSchema: z.ZodEffects<z.ZodUnknown, JobResult | null, unknown> = z
  .unknown()
  .transform(parseHistoryJobResult);

/** Parse and return a complete history job result or null. */
function parseHistoryJobResult(value: unknown): JobResult | null {
  const result = jobResultSchema.nullable().safeParse(value);
  return result.success ? result.data : null;
}

export const jobHistoryFiltersSchema = z.object({
  endDate: z.string(),
  filename: z.string(),
  startDate: z.string(),
}).refine(
  (filters) => !filters.startDate || !filters.endDate || filters.startDate <= filters.endDate,
  "Start date must be before end date.",
);

export const jobHistoryEnvelopeSchema: z.ZodType<ApiEnvelope<JobHistoryResult>, z.ZodTypeDef, unknown> = z.object({
  success: z.boolean(),
  data: z.object({
    has_more: z.boolean(),
    items: z.array(z.object({
      column_count: z.number(),
      created_at: z.string(),
      error_msg: z.string().nullable(),
      filename: z.string(),
      job_id: z.string(),
      result_json: historyJobResultSchema,
      row_count: z.number(),
      status: z.enum(["queued", "processing", "done", "failed"]),
    })),
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  }).nullable(),
  error: z.string().nullable(),
});
