import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { ShowAuthPanel } from "./AuthPanel";

type ProtectedRouteProps = {
  children: ReactNode;
};

/** Protect a view and return either children or the auth panel. */
export function ProtectRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <ShowAuthPanel />;
}
