export interface IMessageMetrics {
  recordAttempt(instanceId: string): void;
  recordSent(instanceId: string, latencyMs: number): void;
  recordFailed(instanceId: string, error: unknown): void;

  getStats(instanceId: string): IMetricsInstanceStats;
}

export interface IMetricsInstance {
  attempts: number;
  sent: number;
  failed: number;
  totalLatency: number;
}

export interface IMetricsInstanceStats extends IMetricsInstance {
  avgLatency: number;
}

export interface IMetricsError {
  message: string;
  name?: string;
  stack?: string;
}
