import { z } from "zod";

const BYTES_PER_MEGABYTE = 1024 * 1024;
export const ACCEPTED_FILE_FORMATS = "CSV, JSON, TSV, TXT, XLS, and XLSX";
export const ACCEPTED_EXTENSIONS = [".csv", ".json", ".tsv", ".txt", ".xls", ".xlsx"];
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * BYTES_PER_MEGABYTE;
const ACCEPTED_MIME_TYPES = ["text/csv", "application/json", "text/tab-separated-values", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"];
const FILE_SIZE_ERROR = `File is too large. Upload files must be ${MAX_FILE_SIZE_MB} MB or smaller.`;
const FILE_TYPE_ERROR = `Invalid file type. Accepted formats: ${ACCEPTED_FILE_FORMATS}.`;

const previewCellSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const parsedFilePreviewSchema = z.object({
  columns: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum(["number", "text", "date", "boolean"]),
    }),
  ),
  rows: z.array(z.record(previewCellSchema)),
});

/** Check and return whether a filename has an accepted upload extension. */
function hasAllowedExtension(fileName: string): boolean {
  return ACCEPTED_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));
}

export const selectedFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, FILE_SIZE_ERROR)
  .refine(
    (file) => ACCEPTED_MIME_TYPES.includes(file.type) || hasAllowedExtension(file.name),
    FILE_TYPE_ERROR,
  );

export const uploadEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.object({
    job_id: z.string().min(1),
    status: z.enum(["queued"]),
  }).nullable(),
  error: z.string().nullable(),
});

export const jobStatusEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.object({
    error_msg: z.string().nullable(),
    job_id: z.string().min(1),
    result_json: z.record(z.unknown()).nullable(),
    status: z.enum(["queued", "processing", "done", "failed"]),
  }).nullable(),
  error: z.string().nullable(),
});
