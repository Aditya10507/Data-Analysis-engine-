import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { z } from "zod";
import { buildAxiosError } from "./apiErrors";
import { refreshTokenRequest } from "./authRefresh";
import { apiClient, publicApiClient } from "./httpClients";
import { streamApi } from "./streamClient";
import { getAccessToken } from "./tokenStorage";

type RetriableRequestConfig = InternalAxiosRequestConfig & { hasRetried?: boolean };
type UploadProgressHandler = (loadedBytes: number, totalBytes: number) => void;

export { apiClient, refreshTokenRequest, streamApi };

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => handleAxiosError(error),
);

/** Request the API and return a schema-validated response envelope. */
export async function requestApi<TData>(path: string, schema: z.ZodType<TData, z.ZodTypeDef, unknown>): Promise<TData> {
  const response = await apiClient.get(path);
  return schema.parse(response.data);
}

/** Post multipart form-data and return a schema-validated envelope. */
export async function postMultipartApi<TData>(
  path: string,
  formData: FormData,
  schema: z.ZodType<TData, z.ZodTypeDef, unknown>,
  onProgress?: UploadProgressHandler,
): Promise<TData> {
  const response = await apiClient.post(path, formData, {
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(event.loaded, event.total);
      }
    },
  });
  return schema.parse(response.data);
}

/** Post public API data and return a schema-validated response envelope. */
export async function postPublicApi<TData, TBody>(
  path: string,
  body: TBody,
  schema: z.ZodType<TData, z.ZodTypeDef, unknown>,
): Promise<TData> {
  const response = await publicApiClient.post(path, body);
  return schema.parse(response.data);
}

/** Handle an axios error with refresh-on-401 and return a response. */
async function handleAxiosError(error: AxiosError) {
  const request = error.config as RetriableRequestConfig | undefined;
  if (error.response?.status === 401 && request && !request.hasRetried) {
    request.hasRetried = true;
    await refreshTokenRequest();
    return apiClient.request(request);
  }

  throw buildAxiosError(error);
}
