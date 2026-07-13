import { DisplayDashboardPage } from "../pages/DashboardPage";
import { DisplayHistoryPage } from "../pages/HistoryPage";
import { DisplayUploadPage } from "../pages/UploadPage";
import { useState } from "react";
import { useAppStore } from "../store/appStore";
import type { AppView } from "../types/app";
import { ProtectRoute } from "./ProtectedRoute";
import { ShowSidebarNav } from "./SidebarNav";
import { ShowTopHeader } from "./TopHeader";
import { ShowReportAssistantCard } from "./ReportAssistantCard";

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
  const jobResult = useAppStore((state) => state.jobResult);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <ShowSidebarNav isOpen={isWorkspaceOpen} onClose={() => setIsWorkspaceOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-col">
          <ShowTopHeader onWorkspaceClick={() => setIsWorkspaceOpen(true)} />
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 sm:px-6 lg:px-10">{renderCurrentPage(activeView)}</main>
        </div>
        {activeView === "dashboard" && jobResult ? <ShowReportAssistantCard jobResult={jobResult} /> : null}
      </div>
    </div>
  );
}
