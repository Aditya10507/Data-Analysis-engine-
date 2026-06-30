export type DownloadKind = "cleaned_csv" | "pdf_report" | "insights_markdown";

export type DownloadRecord = {
  id: string;
  filename: string;
  kind: DownloadKind;
  label: string;
  timestamp: string;
};
