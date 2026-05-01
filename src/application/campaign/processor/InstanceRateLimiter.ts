import { setTimeout } from 'node:timers/promises';

export class InstanceRateLimiter {
  private _sentTimestamps: number[] = [];

  constructor(
    private readonly maxPerMinute: number,
    private readonly maxPerHour: number
  ) {}

  async waitTurn(): Promise<void> {
    while (true) {
      const now = Date.now();

      // limpiar ventanas
      this._sentTimestamps = this._sentTimestamps.filter((t) => now - t < 60 * 60 * 1000);

      const lastMinute = this._sentTimestamps.filter((t) => now - t < 60 * 1000);

      if (lastMinute.length < this.maxPerMinute && this._sentTimestamps.length < this.maxPerHour) {
        this._sentTimestamps.push(now);
        return;
      }

      await this.sleep(1000);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(ms, r));
  }
}
