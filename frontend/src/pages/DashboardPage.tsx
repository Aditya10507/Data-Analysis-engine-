import { useState } from "react";
import { ShowDataPreviewTable } from "../components/DataPreviewTable";
import { ShowAiInsightsPanel } from "../components/AiInsightsPanel";
import { ShowChartPanel, type ChartTab } from "../components/ChartPanel";
import { ShowColumnExplorerPanel } from "../components/ColumnExplorerPanel";
import { ShowDashboardKpis } from "../components/DashboardKpis";
import { ShowDashboardEmptyState } from "../components/DashboardEmptyState";
import { ShowDashboardExportControls } from "../components/DashboardExportControls";
import { ShowDatasetOverviewPanel } from "../components/DatasetOverviewPanel";
import { ShowExecutiveSummaryPanel } from "../components/ExecutiveSummaryPanel";
import { ShowHealthStatusPanel } from "../components/HealthStatusPanel";
import { ShowSmartChartRecommendations } from "../components/SmartChartRecommendations";
import { useFetchHealthStatus } from "../hooks/useHealthStatus";
import { useAppStore } from "../store/appStore";

/** Display and return the dashboard page shell. */
export function DisplayDashboardPage() {
  const [activeChart, setActiveChart] = useState<ChartTab>("distribution");
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const healthState = useFetchHealthStatus();
  const analysisResult = useAppStore((state) => state.analysisResult);
  const jobResult = useAppStore((state) => state.jobResult);
  const parsedPreview = useAppStore((state) => state.parsedPreview);
  const setActiveView = useAppStore((state) => state.setActiveView);

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <ShowHealthStatusPanel {...healthState} />
      {!analysisResult ? <ShowDashboardEmptyState onUploadClick={() => setActiveView("upload")} /> : null}
      {analysisResult ? <ShowDatasetOverviewPanel analysisResult={analysisResult} jobResult={jobResult} preview={parsedPreview} /> : null}
      {analysisResult ? <ShowDashboardKpis analysisResult={analysisResult} /> : null}
      {analysisResult ? <ShowDashboardExportControls /> : null}
      {analysisResult ? <ShowExecutiveSummaryPanel analysisResult={analysisResult} jobResult={jobResult} /> : null}
      {analysisResult ? <ShowSmartChartRecommendations analysisResult={analysisResult} onSelectChart={setActiveChart} /> : null}
      {parsedPreview ? <ShowColumnExplorerPanel onFocusColumn={setSelectedColumn} preview={parsedPreview} selectedColumn={selectedColumn} /> : null}
      {analysisResult ? (
        <ShowChartPanel
          activeTab={activeChart}
          analysisResult={analysisResult}
          jobId={jobResult?.job_id ?? null}
          onActiveTabChange={setActiveChart}
          onSelectedColumnChange={setSelectedColumn}
          selectedColumn={selectedColumn}
        />
      ) : null}
      {analysisResult ? <ShowAiInsightsPanel /> : null}
      {parsedPreview ? <ShowDataPreviewTable preview={parsedPreview} /> : null}
    </section>
  );
}
