import { authEnvelopeSchema } from "../schemas/authSchemas";
import type { TokenPair } from "../types/auth";
import { publicApiClient } from "./httpClients";
import { getRefreshToken, storeTokenPair } from "./tokenStorage";

/** Refresh tokens using the stored refresh token and return the new pair. */
export async function refreshTokenRequest(): Promise<TokenPair> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token is available.");
  }

  const response = await publicApiClient.post("/auth/refresh", {
    refresh_token: refreshToken,
  });
  const envelope = authEnvelopeSchema.parse(response.data);
  storeTokenPair(envelope.data);
  return envelope.data;
}
