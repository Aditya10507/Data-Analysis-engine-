import { ShowDataPreviewTable } from "../components/DataPreviewTable";
import { ShowAiInsightsPanel } from "../components/AiInsightsPanel";
import { ShowChartPanel } from "../components/ChartPanel";
import { ShowDashboardKpis } from "../components/DashboardKpis";
import { ShowDashboardEmptyState } from "../components/DashboardEmptyState";
import { ShowDashboardExportControls } from "../components/DashboardExportControls";
import { ShowHealthStatusPanel } from "../components/HealthStatusPanel";
import { useFetchHealthStatus } from "../hooks/useHealthStatus";
import { useAppStore } from "../store/appStore";

/** Display and return the dashboard page shell. */
export function DisplayDashboardPage() {
  const healthState = useFetchHealthStatus();
  const analysisResult = useAppStore((state) => state.analysisResult);
  const parsedPreview = useAppStore((state) => state.parsedPreview);
  const setActiveView = useAppStore((state) => state.setActiveView);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <ShowHealthStatusPanel {...healthState} />
      {!analysisResult ? <ShowDashboardEmptyState onUploadClick={() => setActiveView("upload")} /> : null}
      {analysisResult ? <ShowDashboardKpis analysisResult={analysisResult} /> : null}
      {analysisResult ? <ShowDashboardExportControls /> : null}
      {analysisResult ? <ShowChartPanel analysisResult={analysisResult} /> : null}
      {analysisResult ? <ShowAiInsightsPanel /> : null}
      {analysisResult ? <p className="text-sm text-slate-500 dark:text-slate-400">{analysisResult.summary}</p> : null}
      {parsedPreview ? <ShowDataPreviewTable preview={parsedPreview} /> : null}
    </section>
  );
}
