import { BaileysRateLimiter } from '@infrastructure/baileys/BaileysRateLimiter';

export class LimiterFactory {
  private readonly _limiters = new Map<string, BaileysRateLimiter>();

  getLimiter(instanceId: string): BaileysRateLimiter {
    if (this._limiters.has(instanceId)) {
      const limiter = this._limiters.get(instanceId);
      if (limiter) return limiter;
    }

    const limiter = new BaileysRateLimiter({
      concurrency: 1,
      minDelayMs: 400 + Math.random() * 300,
    });

    this._limiters.set(instanceId, limiter);
    return limiter;
  }
}
