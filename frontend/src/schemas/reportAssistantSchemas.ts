import { z } from "zod";

export const reportChatEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.object({
    answer: z.string().min(1),
  }).nullable(),
  error: z.string().nullable(),
});
