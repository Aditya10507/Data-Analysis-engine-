import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { refreshTokenRequest } from "../api/apiClient";
import { clearTokenPair, hasStoredAccessToken, storeTokenPair } from "../api/tokenStorage";
import type { AuthCredentials, AuthState, TokenPair } from "../types/auth";

const AuthContext = createContext<AuthState | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

/** Provide and return authentication context state. */
export function ProvideAuth({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasStoredAccessToken());
  const [isLoading, setIsLoading] = useState(false);
  const value = useMemo(
    () => buildAuthState(isAuthenticated, isLoading, setIsAuthenticated, setIsLoading),
    [isAuthenticated, isLoading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Read and return the current authentication context. */
export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthProvider is missing.");
  }
  return context;
}

/** Build and return auth state methods. */
function buildAuthState(
  isAuthenticated: boolean,
  isLoading: boolean,
  setIsAuthenticated: (value: boolean) => void,
  setIsLoading: (value: boolean) => void,
): AuthState {
  return {
    isAuthenticated,
    isLoading,
    login: (credentials) => runAuthAction(loginUser, credentials, setIsAuthenticated, setIsLoading),
    logout: () => logoutUser(setIsAuthenticated),
    refresh: () => refreshTokens(setIsAuthenticated),
    register: (credentials) => runAuthAction(registerUser, credentials, setIsAuthenticated, setIsLoading),
  };
}

/** Run a login/register action and return no content. */
async function runAuthAction(
  action: (credentials: AuthCredentials) => Promise<TokenPair>,
  credentials: AuthCredentials,
  setIsAuthenticated: (value: boolean) => void,
  setIsLoading: (value: boolean) => void,
): Promise<void> {
  setIsLoading(true);
  try {
    storeTokenPair(await action(credentials));
    setIsAuthenticated(true);
  } finally {
    setIsLoading(false);
  }
}

/** Refresh current tokens and return no content. */
async function refreshTokens(setIsAuthenticated: (value: boolean) => void): Promise<void> {
  storeTokenPair(await refreshTokenRequest());
  setIsAuthenticated(true);
}

/** Log out the current user and return no content. */
function logoutUser(setIsAuthenticated: (value: boolean) => void): void {
  clearTokenPair();
  setIsAuthenticated(false);
}
