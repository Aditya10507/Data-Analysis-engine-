import { z } from "zod";

const previewCellSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const dataQualitySchema = z.object({
  duplicate_percent: z.number(),
  grade: z.string().min(1),
  issues: z.array(z.object({
    label: z.string().min(1),
    severity: z.enum(["info", "warning"]),
    value: z.string(),
  })),
  null_percent: z.number(),
  outlier_percent: z.number(),
  score: z.number(),
});

export const jobResultSchema = z.object({
  column_meta: z.record(z.object({
    dtype: z.string().optional().nullable(),
    semantic_type: z.string().optional().nullable(),
  })),
  data_quality: dataQualitySchema.optional(),
  download_urls: z.object({
    cleaned_csv: z.string().url(),
    original: z.string().url(),
  }),
  filename: z.string().min(1),
  insights: z.array(z.object({
    body: z.string(),
    headline: z.string(),
    type: z.enum(["trend", "warning", "info"]),
  })),
  job_id: z.string().min(1),
  preview: z.array(z.record(previewCellSchema)),
  shape: z.tuple([z.number(), z.number()]),
  status: z.string().min(1),
});
