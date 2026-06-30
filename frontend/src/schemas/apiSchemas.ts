import { z } from "zod";

export const healthStatusSchema = z.object({
  status: z.string().min(1),
  service: z.string().min(1),
});

export const healthEnvelopeSchema = z.object({
  success: z.boolean(),
  data: healthStatusSchema,
  error: z.string().nullable(),
});
