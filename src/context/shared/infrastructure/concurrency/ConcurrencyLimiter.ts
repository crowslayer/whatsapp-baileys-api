export interface IConcurrencyLimiterOptions {
  concurrency: number;
}

export class ConcurrencyLimiter {
  private readonly _concurrency: number;
  private _running = 0;

  constructor(options: IConcurrencyLimiterOptions) {
    if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
      throw new Error('Concurrency must be a positive integer');
    }

    this._concurrency = options.concurrency;
  }

  get runningCount(): number {
    return this._running;
  }

  get availableSlots(): number {
    return Math.max(0, this._concurrency - this._running);
  }

  get limit(): number {
    return this._concurrency;
  }

  get isFull(): boolean {
    return this._running >= this._concurrency;
  }

  tryAcquire(): boolean {
    if (this.isFull) {
      return false;
    }

    this._running += 1;

    return true;
  }

  release(): void {
    if (this._running <= 0) {
      return;
    }

    this._running -= 1;
  }

  async execute<T>(task: () => Promise<T>): Promise<T> {
    if (!this.tryAcquire()) {
      throw new Error('Concurrency limit reached');
    }

    try {
      return await task();
    } finally {
      this.release();
    }
  }
}
