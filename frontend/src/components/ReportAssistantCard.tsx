import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useReportAssistant } from "../hooks/useReportAssistant";
import type { JobResult } from "../types/files";
import { ShowAssistantMessageBubble } from "./AssistantMessageBubble";

type ReportAssistantCardProps = {
  jobResult: JobResult;
};

const SUGGESTED_QUESTIONS = [
  "Why are null values high?",
  "Which column affects results most?",
  "Explain this chart",
  "What action should I take?",
];

/** Show and return the report-aware assistant chat card. */
export function ShowReportAssistantCard({ jobResult }: ReportAssistantCardProps) {
  const assistant = useReportAssistant({ jobId: jobResult.job_id });

  return (
    <section className="sticky top-4 mt-6 rounded-lg border border-indigo-100 bg-indigo-50/95 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Report Assistant</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300">Ask only about this report.</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((question) => (
          <button
            key={question}
            className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-100 dark:bg-slate-950 dark:text-indigo-300 dark:ring-slate-800"
            type="button"
            disabled={assistant.isLoading}
            onClick={() => void assistant.submitQuestion(question)}
          >
            {question}
          </button>
        ))}
      </div>
      <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
        {assistant.messages.map((message) => (
          <ShowAssistantMessageBubble key={message.id} message={message} />
        ))}
      </div>
      {assistant.errorMessage ? <p className="mt-2 text-xs font-medium text-red-600">{assistant.errorMessage}</p> : null}
      <form className="mt-4 flex gap-2" onSubmit={(event) => void handleSubmit(event, () => assistant.submitQuestion())}>
        <input
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-950 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          placeholder="Ask about charts..."
          value={assistant.draft}
          onChange={(event) => assistant.setDraft(event.target.value)}
        />
        <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60" type="submit" disabled={assistant.isLoading}>
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

/** Submit the assistant question and return no content. */
async function handleSubmit(event: FormEvent<HTMLFormElement>, submitQuestion: () => Promise<void>): Promise<void> {
  event.preventDefault();
  await submitQuestion();
}
