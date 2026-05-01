import { InstanceRateLimiter } from '@application/campaign/processor/InstanceRateLimiter';

export class InstanceRateLimiterFactory {
  private _map = new Map<string, InstanceRateLimiter>();

  get(instanceId: string): InstanceRateLimiter {
    if (!this._map.has(instanceId)) {
      this._map.set(
        instanceId,
        new InstanceRateLimiter(20, 500) // ejemplo
      );
    }

    const limiter = this._map.get(instanceId);
    if (!limiter) {
      throw new Error('Limiter not found');
    }
    return limiter;
  }
}
