import {
  IMessageMetrics,
  IMetricsError,
  IMetricsInstance,
  IMetricsInstanceStats,
} from '@infrastructure/metrics/IMessageMetrics';

export class MessageMetrics implements IMessageMetrics {
  private _data: Map<string, IMetricsInstance> = new Map();

  private get(instanceId: string): IMetricsInstance {
    let metrics = this._data.get(instanceId);

    if (!metrics) {
      metrics = {
        attempts: 0,
        sent: 0,
        failed: 0,
        totalLatency: 0,
      };
      this._data.set(instanceId, metrics);
    }

    return metrics;
  }

  recordAttempt(instanceId: string): void {
    const m = this.get(instanceId);
    m.attempts++;
  }

  recordSent(instanceId: string, latencyMs: number): void {
    const m = this.get(instanceId);
    m.sent++;
    m.totalLatency += latencyMs;
  }

  recordFailed(instanceId: string, error: unknown): void {
    const m = this.get(instanceId);
    m.failed++;

    // opcional: normalizar error sin romper el tipado
    const parsedError = this.normalizeError(error);
  }

  getStats(instanceId: string): IMetricsInstanceStats {
    const m = this.get(instanceId);

    return {
      ...m,
      avgLatency: m.sent > 0 ? m.totalLatency / m.sent : 0,
    };
  }

  private normalizeError(error: unknown): IMetricsError {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }

    return {
      message: String(error),
    };
  }
}
