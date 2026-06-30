import { authEnvelopeSchema } from "../schemas/authSchemas";
import type { AuthCredentials, TokenPair } from "../types/auth";
import { postPublicApi } from "./apiClient";

/** Register a user and return issued tokens. */
export async function registerUser(credentials: AuthCredentials): Promise<TokenPair> {
  const envelope = await postPublicApi("/auth/register", credentials, authEnvelopeSchema);
  return envelope.data;
}

/** Log in a user and return issued tokens. */
export async function loginUser(credentials: AuthCredentials): Promise<TokenPair> {
  const envelope = await postPublicApi("/auth/login", credentials, authEnvelopeSchema);
  return envelope.data;
}
