import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { AuthCredentials } from "../types/auth";

type AuthMode = "login" | "register";

/** Show and return the authentication form panel. */
export function ShowAuthPanel() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [password, setPassword] = useState("");
  const { isLoading, login, register } = useAuth();
  const title = mode === "login" ? "Sign in" : "Create account";
  const handleSubmit = createAuthSubmitHandler(mode, { email, password }, login, register, setErrorMessage);

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      <ShowAuthForm
        email={email}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        password={password}
        title={title}
      />
      <ShowModeToggle mode={mode} onToggle={() => setMode(toggleMode(mode))} />
    </section>
  );
}

/** Create and return an auth submit handler. */
function createAuthSubmitHandler(
  mode: AuthMode,
  credentials: AuthCredentials,
  login: (credentials: AuthCredentials) => Promise<void>,
  register: (credentials: AuthCredentials) => Promise<void>,
  setErrorMessage: (message: string | null) => void,
) {
  return async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    try {
      await runAuthSubmit(mode, credentials, login, register);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    }
  };
}

type AuthFormProps = {
  email: string;
  errorMessage: string | null;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  password: string;
  title: string;
};

/** Show and return auth form fields. */
function ShowAuthForm(props: AuthFormProps) {
  return (
    <form className="mt-5 space-y-4" onSubmit={props.onSubmit}>
      <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => props.onEmailChange(event.target.value)} placeholder="Email" type="email" value={props.email} />
      <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" onChange={(event) => props.onPasswordChange(event.target.value)} placeholder="Password" type="password" value={props.password} />
      {props.errorMessage ? <p className="text-sm text-red-600">{props.errorMessage}</p> : null}
      <button className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950" disabled={props.isLoading} type="submit">
        {props.isLoading ? "Please wait" : props.title}
      </button>
    </form>
  );
}

/** Show and return auth mode toggle. */
function ShowModeToggle(props: { mode: AuthMode; onToggle: () => void }) {
  return (
    <button className="mt-4 text-sm font-medium text-blue-700 dark:text-blue-300" onClick={props.onToggle} type="button">
      {props.mode === "login" ? "Create a new account" : "Sign in instead"}
    </button>
  );
}

/** Submit auth credentials and return no content. */
async function runAuthSubmit(
  mode: AuthMode,
  credentials: AuthCredentials,
  login: (credentials: AuthCredentials) => Promise<void>,
  register: (credentials: AuthCredentials) => Promise<void>,
): Promise<void> {
  if (mode === "login") {
    await login(credentials);
    return;
  }
  await register(credentials);
}

/** Toggle and return the next auth mode. */
function toggleMode(mode: AuthMode): AuthMode {
  return mode === "login" ? "register" : "login";
}
