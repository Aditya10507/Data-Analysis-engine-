import type { FilePreview } from "../types/files";

const BYTES_PER_KILOBYTE = 1024;
const SERVER_PREVIEW_EXTENSIONS = [".xls", ".xlsx"];

/** Format and return a compact file size label. */
function formatFileSize(fileSize: number): string {
  const kilobytes = fileSize / BYTES_PER_KILOBYTE;
  const megabytes = kilobytes / BYTES_PER_KILOBYTE;
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${kilobytes.toFixed(1)} KB`;
}

/** Count and return preview rows from a file body. */
function countPreviewRows(fileText: string, fileName: string): number {
  if (!fileName.toLowerCase().endsWith(".json")) {
    return fileText.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  }

  const parsedJson: unknown = JSON.parse(fileText);
  return Array.isArray(parsedJson) ? parsedJson.length : 1;
}

/** Return whether local row counting should be deferred to the backend. */
function shouldUseServerPreview(fileName: string): boolean {
  return SERVER_PREVIEW_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));
}

/** Build and return local metadata for the selected file. */
export async function buildFilePreview(file: File): Promise<FilePreview> {
  try {
    if (shouldUseServerPreview(file.name)) {
      return { name: file.name, rowCount: null, sizeLabel: formatFileSize(file.size) };
    }

    const fileText = await file.text();
    const rowCount = countPreviewRows(fileText, file.name);
    return { name: file.name, rowCount, sizeLabel: formatFileSize(file.size) };
  } catch (error) {
    throw error instanceof Error ? error : new Error("File preview failed.");
  }
}
