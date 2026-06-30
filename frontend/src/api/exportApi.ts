import { apiClient } from "./apiClient";

const PDF_CONTENT_TYPE = "application/pdf";

/** Download and return a PDF report blob for a job. */
export async function downloadReportPdf(jobId: string): Promise<Blob> {
  const response = await apiClient.get(`/api/v1/jobs/${jobId}/report.pdf`, {
    responseType: "blob",
  });
  return new Blob([response.data], { type: PDF_CONTENT_TYPE });
}

/** Trigger and return no content for a browser download URL. */
export function downloadUrl(url: string, filename: string): void {
  const linkElement = document.createElement("a");
  linkElement.href = url;
  linkElement.download = filename;
  linkElement.rel = "noopener";
  document.body.appendChild(linkElement);
  linkElement.click();
  linkElement.remove();
}

/** Trigger and return no content for a blob browser download. */
export function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  try {
    downloadUrl(objectUrl, filename);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
