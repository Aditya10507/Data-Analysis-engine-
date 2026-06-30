export type AuthCredentials = {
  email: string;
  password: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
};
