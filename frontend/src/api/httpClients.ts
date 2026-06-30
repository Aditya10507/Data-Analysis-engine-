import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./apiConfig";
import { buildAxiosError } from "./apiErrors";

export const apiClient = axios.create({ baseURL: API_BASE_URL });
export const publicApiClient = axios.create({ baseURL: API_BASE_URL });

publicApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    throw buildAxiosError(error);
  },
);
