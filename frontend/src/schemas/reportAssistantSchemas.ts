import { z } from "zod";

export const reportChatEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.object({
    answer: z.string().min(1),
    source: z.enum(["groq", "report", "guardrail"]),
  }).nullable(),
  error: z.string().nullable(),
});
