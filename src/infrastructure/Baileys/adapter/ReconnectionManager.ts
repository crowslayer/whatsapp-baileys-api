// ReconnectionManager.ts
export class ReconnectionManager {
  private _attempts = 0;
  private readonly _maxAttempts = 5;
  private readonly _baseDelay = 1000;

  getDelay(): number {
    return Math.min(this._baseDelay * Math.pow(2, this._attempts), 30000);
  }

  shouldRetry(): boolean {
    return this._attempts < this._maxAttempts;
  }

  onAttempt(): void {
    this._attempts++;
  }

  reset(): void {
    this._attempts = 0;
  }
}
