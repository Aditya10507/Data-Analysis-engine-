import type { JobResult } from "./files";

export type ReportVersion = {
  created_at: string;
  result_json: JobResult;
  version_id: string;
  version_number: number;
};

export type ReportVersionList = {
  items: ReportVersion[];
  job_id: string;
};
