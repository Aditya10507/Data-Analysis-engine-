export type InsightKind = "trend" | "warning" | "info";

export type InsightStreamEventKind = "start" | "chunk" | "end" | "done";

export type InsightCard = {
  body: string;
  headline: string;
  id: string;
  kind: InsightKind;
};

export type InsightStreamEvent = {
  body?: string | null;
  event: InsightStreamEventKind;
  headline?: string | null;
  id?: string | null;
  kind?: InsightKind | null;
};
