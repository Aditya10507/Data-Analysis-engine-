import { API_BASE_URL } from "./apiConfig";
import { buildFetchError, buildNetworkError } from "./apiErrors";
import { refreshTokenRequest } from "./authRefresh";
import { getAccessToken } from "./tokenStorage";

type RequestOptions = { body?: BodyInit; method?: string };
type StreamMessageHandler = (message: string) => void;

/** Stream SSE API messages and return no content. */
export async function streamApi(path: string, onMessage: StreamMessageHandler): Promise<void> {
  const response = await fetchStreamApi(path, {});
  await readSseStream(response, onMessage);
}

/** Fetch and return an SSE API response. */
async function fetchStreamApi(path: string, options: RequestOptions): Promise<Response> {
  const response = await requestStreamResponse(path, options);

  if (response.status === 401) {
    await refreshTokenRequest();
    return fetchStreamApi(path, options);
  }

  if (!response.ok) {
    throw buildFetchError(response);
  }

  return response;
}

/** Request and return a stream response or a network error. */
async function requestStreamResponse(path: string, options: RequestOptions): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      body: options.body,
      headers: buildFetchHeaders(),
      method: options.method ?? "GET",
    });
  } catch (error) {
    throw buildNetworkError();
  }
}

/** Build and return headers for fetch-based requests. */
function buildFetchHeaders(): HeadersInit {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/** Read an SSE response stream and return no content. */
async function readSseStream(response: Response, onMessage: StreamMessageHandler): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("The streaming response could not be read.");
  }
  await readStreamChunks(reader, onMessage);
}

/** Read stream chunks and return no content. */
async function readStreamChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onMessage: StreamMessageHandler,
): Promise<void> {
  let buffer = "";
  let isDone = false;
  while (!isDone) {
    const result = await reader.read();
    isDone = result.done;
    buffer += result.value ? new TextDecoder().decode(result.value) : "";
    parseSseMessages(buffer).forEach(onMessage);
    buffer = buffer.includes("\n\n") ? buffer.slice(buffer.lastIndexOf("\n\n") + 2) : buffer;
  }
}

/** Parse SSE text and return message payloads. */
function parseSseMessages(buffer: string): string[] {
  return buffer.split("\n\n")
    .filter((eventText) => eventText.trim().startsWith("data:"))
    .map((eventText) => eventText.replace(/^data:\s?/m, "").trim());
}
