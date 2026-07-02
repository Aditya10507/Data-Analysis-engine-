import { Bot, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { askReportAssistant } from "../api/reportAssistantApi";

type ChartAiActionsProps = {
  chartLabel: string;
  jobId: string | null;
};

type ChartAction = {
  label: string;
  prompt: string;
};

const CHART_ACTIONS: ChartAction[] = [
  { label: "Explain this chart", prompt: "Explain the {chart} chart in plain English." },
  { label: "Find anomalies", prompt: "Find anomalies or risks visible in the {chart} chart." },
  { label: "What next?", prompt: "Recommend the next action based on the {chart} chart." },
];

/** Show and return chart-level AI assistant actions. */
export function ShowChartAiActions({ chartLabel, jobId }: ChartAiActionsProps) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-2">
        <Bot className="h-4 w-4 text-blue-600" aria-hidden="true" />
        {CHART_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-60 dark:bg-slate-900 dark:text-slate-200"
            type="button"
            disabled={!jobId || activeAction !== null}
            onClick={() => void requestChartAnswer(action, chartLabel, jobId, setAnswer, setErrorMessage, setActiveAction)}
          >
            {activeAction === action.label ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {action.label}
          </button>
        ))}
      </div>
      {answer ? <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{answer}</p> : null}
      {errorMessage ? <p className="mt-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
    </div>
  );
}

/** Request and show a chart-level answer. */
async function requestChartAnswer(
  action: ChartAction,
  chartLabel: string,
  jobId: string | null,
  setAnswer: (answer: string | null) => void,
  setErrorMessage: (errorMessage: string | null) => void,
  setActiveAction: (activeAction: string | null) => void,
): Promise<void> {
  try {
    if (!jobId) {
      throw new Error("Load a completed report before asking AI about charts.");
    }

    setActiveAction(action.label);
    setErrorMessage(null);
    const question = action.prompt.replace("{chart}", chartLabel);
    const envelope = await askReportAssistant(jobId, question);
    setAnswer(envelope.data?.answer ?? "No answer returned.");
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : "Chart assistant failed.");
  } finally {
    setActiveAction(null);
  }
}
