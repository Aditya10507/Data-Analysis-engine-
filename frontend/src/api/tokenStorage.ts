import type { TokenPair } from "../types/auth";

const ACCESS_TOKEN_KEY = "ai_analyst_access_token";
const REFRESH_TOKEN_KEY = "ai_analyst_refresh_token";

/** Read and return the stored access token. */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Read and return the stored refresh token. */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Store token values and return no content. */
export function storeTokenPair(tokenPair: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokenPair.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokenPair.refresh_token);
}

/** Clear token values and return no content. */
export function clearTokenPair(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Return whether a stored access token exists. */
export function hasStoredAccessToken(): boolean {
  return Boolean(getAccessToken());
}
