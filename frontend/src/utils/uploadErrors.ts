import { ZodError } from "zod";
import { ACCEPTED_FILE_FORMATS, MAX_FILE_SIZE_MB } from "../schemas/fileSchemas";

const PARSE_ROW_PATTERN = /row\s+(\d+)/i;
const PARSE_LINE_PATTERN = /line\s+(\d+)/i;
const DEFAULT_PARSE_ROW = "unknown";

/** Format and return a file selection error message. */
export function formatFileSelectionError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? buildAcceptedFormatsMessage();
  }

  if (error instanceof SyntaxError) {
    return formatParseError(error.message);
  }

  return error instanceof Error ? error.message : "File selection failed.";
}

/** Format and return a parse error message with row context. */
export function formatParseError(errorMessage: string): string {
  const rowLabel = readFailedRow(errorMessage);
  return `Parse error on row ${rowLabel}: ${errorMessage}`;
}

/** Format and return a backend job failure message. */
export function formatJobFailure(errorMessage: string | null): string {
  if (!errorMessage) {
    return "The analysis job failed before the backend returned details.";
  }

  return isParseError(errorMessage) ? formatParseError(errorMessage) : errorMessage;
}

/** Build and return accepted upload formats copy. */
export function buildAcceptedFormatsMessage(): string {
  return `Accepted formats: ${ACCEPTED_FILE_FORMATS}. Maximum file size: ${MAX_FILE_SIZE_MB} MB.`;
}

/** Check and return whether an error looks like a parse failure. */
function isParseError(errorMessage: string): boolean {
  const lowerMessage = errorMessage.toLowerCase();
  return (
    lowerMessage.includes("parse") ||
    PARSE_ROW_PATTERN.test(errorMessage) ||
    PARSE_LINE_PATTERN.test(errorMessage)
  );
}

/** Read and return the failed row label from an error message. */
function readFailedRow(errorMessage: string): string {
  const rowMatch = errorMessage.match(PARSE_ROW_PATTERN);
  const lineMatch = errorMessage.match(PARSE_LINE_PATTERN);
  return rowMatch?.[1] ?? lineMatch?.[1] ?? DEFAULT_PARSE_ROW;
}
