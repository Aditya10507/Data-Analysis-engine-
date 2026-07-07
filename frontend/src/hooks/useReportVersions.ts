import { useEffect, useState } from "react";
import { fetchReportVersions } from "../api/reportVersionsApi";
import type { ReportVersion } from "../types/reportVersions";

type ReportVersionsState = {
  errorMessage: string | null;
  isLoading: boolean;
  versions: ReportVersion[];
};

const INITIAL_STATE: ReportVersionsState = {
  errorMessage: null,
  isLoading: false,
  versions: [],
};

/** Load and return saved report versions for one job. */
export function useReportVersions(jobId: string | null): ReportVersionsState {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    if (!jobId) {
      setState(INITIAL_STATE);
      return undefined;
    }

    let isCancelled = false;
    void loadVersions(jobId, setState, () => isCancelled);
    return () => {
      isCancelled = true;
    };
  }, [jobId]);

  return state;
}

/** Fetch report versions and update state. */
async function loadVersions(jobId: string, setState: (state: ReportVersionsState) => void, isCancelled: () => boolean): Promise<void> {
  try {
    setState({ ...INITIAL_STATE, isLoading: true });
    const envelope = await fetchReportVersions(jobId);
    if (!isCancelled()) {
      setState({ errorMessage: null, isLoading: false, versions: envelope.data?.items ?? [] });
    }
  } catch (error) {
    if (!isCancelled()) {
      setState({ errorMessage: readErrorMessage(error), isLoading: false, versions: [] });
    }
  }
}

/** Read and return a user-facing error message. */
function readErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load report versions.";
}
