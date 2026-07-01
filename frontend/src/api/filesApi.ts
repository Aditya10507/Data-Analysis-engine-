import { uploadEnvelopeSchema } from "../schemas/fileSchemas";
import type { ApiEnvelope } from "../types/api";
import type { UploadJob } from "../types/files";
import { postMultipartApi } from "./apiClient";

const UPLOAD_PATH = "/api/v1/files/upload";
const FILE_FIELD_NAME = "file";
type UploadProgressHandler = (loadedBytes: number, totalBytes: number) => void;

/** Upload and return a backend job envelope for the selected file. */
export async function uploadFile(file: File, onProgress?: UploadProgressHandler): Promise<ApiEnvelope<UploadJob>> {
  try {
    const formData = new FormData();
    formData.append(FILE_FIELD_NAME, file);
    return await postMultipartApi(UPLOAD_PATH, formData, uploadEnvelopeSchema, onProgress);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("File upload request failed.");
  }
}
