import { DisplayDashboardPage } from "../pages/DashboardPage";
import { DisplayHistoryPage } from "../pages/HistoryPage";
import { DisplayUploadPage } from "../pages/UploadPage";
import { useAppStore } from "../store/appStore";
import type { AppView } from "../types/app";
import { ProtectRoute } from "./ProtectedRoute";
import { ShowSidebarNav } from "./SidebarNav";
import { ShowTopHeader } from "./TopHeader";

/** Render and return the selected app page. */
function renderCurrentPage(activeView: AppView) {
  if (activeView === "dashboard") {
    return <ProtectRoute><DisplayDashboardPage /></ProtectRoute>;
  }

  if (activeView === "history") {
    return <ProtectRoute><DisplayHistoryPage /></ProtectRoute>;
  }

  return <ProtectRoute><DisplayUploadPage /></ProtectRoute>;
}

/** Arrange and return the authenticated application shell. */
export function ShowAppShell() {
  const activeView = useAppStore((state) => state.activeView);
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen">
          <ShowSidebarNav />
          <div className="flex min-w-0 flex-1 flex-col">
            <ShowTopHeader />
            <main className="flex-1 overflow-y-auto px-6 py-6">
              {renderCurrentPage(activeView)}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
