export type AssistantRole = "assistant" | "user";

export type AssistantMessage = {
  content: string;
  id: string;
  role: AssistantRole;
};
