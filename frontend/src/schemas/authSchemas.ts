import { z } from "zod";

/** Validate and return a token pair response payload. */
export const tokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("bearer"),
});

/** Validate and return an auth envelope response payload. */
export const authEnvelopeSchema = z.object({
  data: tokenPairSchema,
  error: z.string().nullable(),
  success: z.boolean(),
});
