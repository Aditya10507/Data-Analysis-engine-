import type { JobResult } from "./files";

export type JobHistoryStatus = "queued" | "processing" | "done" | "failed";

export type JobHistoryItem = {
  column_count: number;
  created_at: string;
  error_msg: string | null;
  filename: string;
  job_id: string;
  result_json: JobResult | null;
  row_count: number;
  status: JobHistoryStatus;
};

export type JobHistoryResult = {
  has_more: boolean;
  items: JobHistoryItem[];
  limit: number;
  offset: number;
  total: number;
};

export type JobHistoryFilters = {
  endDate: string;
  filename: string;
  startDate: string;
};
