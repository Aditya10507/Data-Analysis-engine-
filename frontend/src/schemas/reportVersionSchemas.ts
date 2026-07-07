import { z } from "zod";
import type { ApiEnvelope } from "../types/api";
import type { ReportVersionList } from "../types/reportVersions";
import { jobResultSchema } from "./jobResultSchemas";

export const reportVersionEnvelopeSchema: z.ZodType<ApiEnvelope<ReportVersionList>, z.ZodTypeDef, unknown> = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(z.object({
      created_at: z.string(),
      result_json: jobResultSchema,
      version_id: z.string(),
      version_number: z.number(),
    })),
    job_id: z.string(),
  }).nullable(),
  error: z.string().nullable(),
});
