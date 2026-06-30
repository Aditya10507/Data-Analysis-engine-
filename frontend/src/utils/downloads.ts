import type { DownloadKind, DownloadRecord } from "../types/downloads";

/** Build and return a recent-download store record. */
export function buildDownloadRecord(
  kind: DownloadKind,
  filename: string,
  label: string,
): DownloadRecord {
  return {
    filename,
    id: crypto.randomUUID(),
    kind,
    label,
    timestamp: new Date().toISOString(),
  };
}

/** Format and return a compact download timestamp. */
export function formatDownloadTime(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
