import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJobHistory } from "../api/jobsApi";
import { jobHistoryFiltersSchema } from "../schemas/historySchemas";
import type { JobHistoryFilters, JobHistoryItem } from "../types/history";

const HISTORY_PAGE_LIMIT = 20;

export type JobHistoryState = {
  errorMessage: string | null;
  hasMore: boolean;
  isLoading: boolean;
  items: JobHistoryItem[];
  loadOlder: () => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
};

/** Load and return paginated job history state. */
export function useJobHistory(filters: JobHistoryFilters): JobHistoryState {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<JobHistoryItem[]>([]);
  const offsetRef = useRef(0);

  const loadPage = useCallback((pageOffset: number, isReset: boolean) => {
    void fetchHistoryPage(filters, pageOffset, isReset, {
      setErrorMessage, setHasMore, setIsLoading, setItems,
    });
    offsetRef.current = isReset ? HISTORY_PAGE_LIMIT : pageOffset + HISTORY_PAGE_LIMIT;
  }, [filters]);

  useEffect(() => {
    offsetRef.current = 0;
    loadPage(0, true);
  }, [loadPage]);

  const loadOlder = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(offsetRef.current, false);
    }
  }, [hasMore, isLoading, loadPage]);

  const sentinelRef = useInfiniteHistorySentinel(hasMore, isLoading, loadOlder);
  return { errorMessage, hasMore, isLoading, items, loadOlder, sentinelRef };
}

type HistorySetters = {
  setErrorMessage: (message: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setItems: (items: JobHistoryItem[] | ((items: JobHistoryItem[]) => JobHistoryItem[])) => void;
};

/** Fetch a history page and return no content. */
async function fetchHistoryPage(
  filters: JobHistoryFilters,
  offset: number,
  isReset: boolean,
  setters: HistorySetters,
): Promise<void> {
  try {
    setters.setIsLoading(true);
    const validFilters = jobHistoryFiltersSchema.parse(filters);
    const envelope = await fetchJobHistory(HISTORY_PAGE_LIMIT, offset, validFilters);
    const result = envelope.data;
    setters.setErrorMessage(null);
    setters.setHasMore(result?.has_more ?? false);
    setters.setItems((items) => (isReset ? result?.items ?? [] : [...items, ...(result?.items ?? [])]));
  } catch (error) {
    setters.setErrorMessage(error instanceof Error ? error.message : "Job history failed.");
  } finally {
    setters.setIsLoading(false);
  }
}

/** Observe the sentinel and return a ref callback for infinite loading. */
function useInfiniteHistorySentinel(
  hasMore: boolean,
  isLoading: boolean,
  loadOlder: () => void,
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  return useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node || isLoading || !hasMore) {
      return;
    }
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        loadOlder();
      }
    });
    observerRef.current.observe(node);
  }, [hasMore, isLoading, loadOlder]);
}
