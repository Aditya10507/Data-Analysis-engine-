import { useEffect, useState } from "react";
import { fetchHealthStatus } from "../api/healthApi";
import { useAppStore } from "../store/appStore";
import type { HealthStatus } from "../types/api";

type HealthState = {
  healthStatus: HealthStatus | null;
  errorMessage: string | null;
  isLoading: boolean;
};

const INITIAL_HEALTH_STATE: HealthState = {
  healthStatus: null,
  errorMessage: null,
  isLoading: true,
};

/** Fetch and return backend health status state for UI rendering. */
export function useFetchHealthStatus(): HealthState {
  const [healthState, setHealthState] = useState(INITIAL_HEALTH_STATE);
  const setApiConnection = useAppStore((state) => state.setApiConnection);

  useEffect(() => {
    /** Load and store the latest backend health status. */
    async function loadHealthStatus(): Promise<void> {
      setHealthState({ ...INITIAL_HEALTH_STATE });

      try {
        const envelope = await fetchHealthStatus();
        setApiConnection(envelope.success);
        setHealthState({
          healthStatus: envelope.data,
          errorMessage: envelope.error,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Health check failed.";
        setApiConnection(false);
        setHealthState({ healthStatus: null, errorMessage, isLoading: false });
      }
    }

    void loadHealthStatus();
  }, [setApiConnection]);

  return healthState;
}
