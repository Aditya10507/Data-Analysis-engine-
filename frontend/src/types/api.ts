export type ApiEnvelope<TData> = {
  success: boolean;
  data: TData | null;
  error: string | null;
};

export type HealthStatus = {
  status: string;
  service: string;
};
