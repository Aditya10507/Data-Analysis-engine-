import { AxiosError } from "axios";
import { SERVER_ERROR_STATUS, TOO_MANY_REQUESTS_STATUS } from "./apiConfig";
import { useToastStore } from "../store/toastStore";
import { clearTokenPair } from "./tokenStorage";

type ErrorResponse = { detail?: unknown; error?: unknown };
const NETWORK_ERROR_MESSAGE = "Check your connection or try again in a moment.";
const NETWORK_ERROR_TITLE = "Network error";

/** Build and return a user-facing HTTP error from a failed axios response. */
export function buildAxiosError(error: AxiosError): Error {
  if (!error.response) {
    showNetworkToast();
    return new Error(NETWORK_ERROR_MESSAGE);
  }

  const errorMessage = readErrorMessage(error);
  if (error.response?.status === 401) {
    clearTokenPair();
    return new Error(errorMessage ?? "Your session has expired. Please sign in again.");
  }

  if (error.response?.status === TOO_MANY_REQUESTS_STATUS) {
    return new Error("Too many requests. Please wait and try again.");
  }

  if (error.response && error.response.status >= SERVER_ERROR_STATUS) {
    return new Error("The server is unavailable. Please try again soon.");
  }

  return new Error(errorMessage ?? error.message ?? "API request failed.");
}

/** Build, toast, and return a network error. */
export function buildNetworkError(): Error {
  showNetworkToast();
  return new Error(NETWORK_ERROR_MESSAGE);
}

/** Build and return a user-facing HTTP error from a fetch response. */
export function buildFetchError(response: Response): Error {
  if (response.status === TOO_MANY_REQUESTS_STATUS) {
    return new Error("Too many requests. Please wait and try again.");
  }
  return new Error(`Request failed with status ${response.status}.`);
}

/** Read and return an API error message when the server provides one. */
function readErrorMessage(error: AxiosError): string | null {
  const data = error.response?.data as ErrorResponse | undefined;
  if (typeof data?.detail === "string") {
    return data.detail;
  }
  if (typeof data?.error === "string") {
    return data.error;
  }
  return null;
}

/** Show a network toast and return no content. */
function showNetworkToast(): void {
  useToastStore.getState().addToast({
    kind: "error",
    message: NETWORK_ERROR_MESSAGE,
    title: NETWORK_ERROR_TITLE,
  });
}
