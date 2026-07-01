import { useState, type Dispatch, type SetStateAction } from "react";
import { askReportAssistant } from "../api/reportAssistantApi";
import type { AssistantMessage } from "../types/assistant";

const WELCOME_MESSAGE = "Ask me about this report: missing values, duplicates, columns, charts, or recommendations.";

type ReportAssistantInput = {
  jobId: string;
};

/** Manage and return report assistant chat state. */
export function useReportAssistant(input: ReportAssistantInput) {
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([buildAssistantMessage(WELCOME_MESSAGE)]);

  async function submitQuestion(): Promise<void> {
    const question = draft.trim();
    if (!question) {
      return;
    }

    setMessages((items) => [...items, buildUserMessage(question)]);
    setDraft("");
    await requestAssistantAnswer(input.jobId, question, setMessages, setErrorMessage, setIsLoading);
  }

  return { draft, errorMessage, isLoading, messages, setDraft, submitQuestion };
}

/** Request and append an assistant answer. */
async function requestAssistantAnswer(
  jobId: string,
  question: string,
  setMessages: Dispatch<SetStateAction<AssistantMessage[]>>,
  setErrorMessage: Dispatch<SetStateAction<string | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
): Promise<void> {
  try {
    setErrorMessage(null);
    setIsLoading(true);
    const envelope = await askReportAssistant(jobId, question);
    setMessages((items) => [...items, buildAssistantMessage(envelope.data?.answer ?? "No answer returned.")]);
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : "Report assistant failed.");
  } finally {
    setIsLoading(false);
  }
}

/** Build and return an assistant message. */
function buildAssistantMessage(content: string): AssistantMessage {
  return { content, id: crypto.randomUUID(), role: "assistant" };
}

/** Build and return a user message. */
function buildUserMessage(content: string): AssistantMessage {
  return { content, id: crypto.randomUUID(), role: "user" };
}
