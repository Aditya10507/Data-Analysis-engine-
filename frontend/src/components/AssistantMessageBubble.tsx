import { Bot, UserRound } from "lucide-react";
import type { AssistantMessage } from "../types/assistant";

type AssistantMessageBubbleProps = {
  message: AssistantMessage;
};

/** Show and return one assistant chat message bubble. */
export function ShowAssistantMessageBubble({ message }: AssistantMessageBubbleProps) {
  const isUser = message.role === "user";
  const Icon = isUser ? UserRound : Bot;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[92%] gap-2 rounded-lg px-3 py-2 ${buildBubbleClass(isUser)}`}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="whitespace-pre-line text-xs leading-5">{message.content}</p>
      </div>
    </div>
  );
}

/** Build and return message bubble color classes. */
function buildBubbleClass(isUser: boolean): string {
  if (isUser) {
    return "bg-blue-600 text-white";
  }

  return "border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200";
}
