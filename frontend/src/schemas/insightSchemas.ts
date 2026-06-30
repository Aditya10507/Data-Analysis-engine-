import { z } from "zod";

export const insightStreamEventSchema = z.object({
  body: z.string().nullable().optional(),
  event: z.enum(["start", "chunk", "end", "done"]),
  headline: z.string().nullable().optional(),
  id: z.string().nullable().optional(),
  kind: z.enum(["trend", "warning", "info"]).nullable().optional(),
});
