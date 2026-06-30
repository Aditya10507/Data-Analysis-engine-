import type { AnalysisResult } from "./analysis";

export type AppView = "upload" | "dashboard" | "history";

export type AnalysisStatus = "idle" | "uploading" | "queued" | "processing" | "done" | "failed";

export type { AnalysisResult };
