import { InstanceRateLimiter } from '@modules/campaign/application/processor/InstanceRateLimiter';
import { LimiterNotFoundError } from '@modules/campaign/application/processor/LimiterNotFoundError';

export class InstanceRateLimiterFactory {
  private readonly _map = new Map<string, InstanceRateLimiter>();

  get(instanceId: string): InstanceRateLimiter {
    if (!this._map.has(instanceId)) {
      this._map.set(instanceId, new InstanceRateLimiter(20, 500));
    }

    const limiter = this._map.get(instanceId);

    if (!limiter) {
      throw new LimiterNotFoundError(
        `Critical: Failed to resolve or initialize InstanceRateLimiter for instance <${instanceId}>.`
      );
    }
    return limiter;
  }
}
