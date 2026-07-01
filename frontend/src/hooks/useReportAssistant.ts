import { useState } from "react";
import type { AnalysisResult } from "../types/analysis";
import type { AssistantMessage } from "../types/assistant";
import type { JobResult } from "../types/files";
import { buildReportAnswer } from "../utils/reportAssistant";

const WELCOME_MESSAGE = "Ask me about this report: missing values, duplicates, columns, charts, or recommendations.";

type ReportAssistantInput = {
  analysisResult: AnalysisResult;
  jobResult: JobResult | null;
};

/** Manage and return report assistant chat state. */
export function useReportAssistant(input: ReportAssistantInput) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([buildAssistantMessage(WELCOME_MESSAGE)]);

  function submitQuestion(): void {
    const question = draft.trim();
    if (!question) {
      return;
    }

    const answer = buildReportAnswer({ ...input, question });
    setMessages((items) => [...items, buildUserMessage(question), buildAssistantMessage(answer)]);
    setDraft("");
  }

  return { draft, messages, setDraft, submitQuestion };
}

/** Build and return an assistant message. */
function buildAssistantMessage(content: string): AssistantMessage {
  return { content, id: crypto.randomUUID(), role: "assistant" };
}

/** Build and return a user message. */
function buildUserMessage(content: string): AssistantMessage {
  return { content, id: crypto.randomUUID(), role: "user" };
}
