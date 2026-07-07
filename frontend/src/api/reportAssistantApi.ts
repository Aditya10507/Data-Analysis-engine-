import { reportChatEnvelopeSchema } from "../schemas/reportAssistantSchemas";
import type { ApiEnvelope } from "../types/api";
import { apiClient } from "./apiClient";

const REPORT_CHAT_PATH = "/api/v1/assistant/report-chat";

type ReportChatResult = {
  answer: string;
  source: "groq" | "report" | "guardrail";
};

/** Ask the report assistant and return an answer envelope. */
export async function askReportAssistant(jobId: string, question: string): Promise<ApiEnvelope<ReportChatResult>> {
  const response = await apiClient.post(REPORT_CHAT_PATH, { job_id: jobId, question });
  return reportChatEnvelopeSchema.parse(response.data);
}
