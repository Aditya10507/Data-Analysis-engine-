import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../store/appStore";
import { ShowThemeToggle } from "./ThemeToggle";

const USER_INITIALS = "DA";

/** Build and return a display title for the active view. */
function buildTitle(activeView: string): string {
  return activeView.charAt(0).toUpperCase() + activeView.slice(1);
}

/** Show and return the top application header. */
export function ShowTopHeader() {
  const activeView = useAppStore((state) => state.activeView);
  const title = buildTitle(activeView);

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI Data Analyst
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
            {title}
          </h2>
        </div>
        <ShowHeaderActions />
      </div>
    </header>
  );
}

/** Show and return right-side header actions. */
function ShowHeaderActions() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <ShowThemeToggle />
      {isAuthenticated ? <ShowLogoutButton onLogout={logout} /> : null}
      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
        {USER_INITIALS}
      </div>
    </div>
  );
}

/** Show and return the logout button. */
function ShowLogoutButton(props: { onLogout: () => void }) {
  return (
    <button className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={props.onLogout} title="Log out" type="button">
      <LogOut className="h-4 w-4" />
    </button>
  );
}
