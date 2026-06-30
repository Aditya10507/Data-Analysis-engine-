import { useAppStore } from "../store/appStore";
import type { AppView } from "../types/app";
import { ShowRecentDownloads } from "./RecentDownloads";

type NavItem = {
  label: string;
  view: AppView;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Upload", view: "upload" },
  { label: "Dashboard", view: "dashboard" },
  { label: "History", view: "history" },
];

/** Build and return a navigation item class name. */
function buildNavClass(isActive: boolean): string {
  const baseClass = "w-full rounded-md px-3 py-2 text-left text-sm font-medium";
  const activeClass = "bg-slate-950 text-white dark:bg-white dark:text-slate-950";
  const idleClass = "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";
  return `${baseClass} ${isActive ? activeClass : idleClass}`;
}

/** Show and return the application sidebar navigation. */
export function ShowSidebarNav() {
  const activeView = useAppStore((state) => state.activeView);
  const setActiveView = useAppStore((state) => state.setActiveView);

  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:block">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          AI Analyst
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
          Workspace
        </h1>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            className={buildNavClass(activeView === item.view)}
            type="button"
            onClick={() => setActiveView(item.view)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <ShowRecentDownloads />
    </aside>
  );
}
