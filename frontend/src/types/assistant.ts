export type AssistantRole = "assistant" | "user";
export type AssistantSource = "groq" | "report" | "guardrail";

export type AssistantMessage = {
  content: string;
  id: string;
  role: AssistantRole;
  source?: AssistantSource;
};
