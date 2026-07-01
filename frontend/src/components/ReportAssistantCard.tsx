import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useReportAssistant } from "../hooks/useReportAssistant";
import type { AnalysisResult } from "../types/analysis";
import type { JobResult } from "../types/files";
import { ShowAssistantMessageBubble } from "./AssistantMessageBubble";

type ReportAssistantCardProps = {
  analysisResult: AnalysisResult;
  jobResult: JobResult | null;
};

/** Show and return the report-aware assistant chat card. */
export function ShowReportAssistantCard({ analysisResult, jobResult }: ReportAssistantCardProps) {
  const assistant = useReportAssistant({ analysisResult, jobResult });

  return (
    <section className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Report Assistant</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Ask questions about the analysis already produced.</p>
      </div>
      <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-2">
        {assistant.messages.map((message) => (
          <ShowAssistantMessageBubble key={message.id} message={message} />
        ))}
      </div>
      <form className="mt-4 flex gap-2" onSubmit={(event) => handleSubmit(event, assistant.submitQuestion)}>
        <input
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          placeholder="Ask about missing values, duplicates, charts..."
          value={assistant.draft}
          onChange={(event) => assistant.setDraft(event.target.value)}
        />
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
          <Send className="h-4 w-4" aria-hidden="true" />
          Ask
        </button>
      </form>
    </section>
  );
}

/** Submit the assistant question and return no content. */
function handleSubmit(event: FormEvent<HTMLFormElement>, submitQuestion: () => void): void {
  event.preventDefault();
  submitQuestion();
}
