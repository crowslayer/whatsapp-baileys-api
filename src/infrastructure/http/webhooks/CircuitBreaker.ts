export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface ICircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

export class CircuitBreaker {
  private _state: CircuitState = CircuitState.CLOSED;
  private _failureCount = 0;
  private _successCount = 0;
  private _nextAttempt: number;

  constructor(
    private readonly _name: string,
    private readonly _options: ICircuitBreakerOptions,
    private readonly _logger?: { warn: (msg: string) => void; error: (msg: string) => void }
  ) {
    this._nextAttempt = Date.now();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (this._state === CircuitState.OPEN) {
      if (Date.now() < this._nextAttempt) {
        this._logger?.warn(
          `Circuit breaker [${this._name}] is OPEN, skipping request. Next attempt at ${new Date(this._nextAttempt).toISOString()}`
        );
        return undefined;
      }
      this._state = CircuitState.HALF_OPEN;
      this._logger?.warn(`Circuit breaker [${this._name}] entering HALF_OPEN state`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this._failureCount = 0;

    if (this._state === CircuitState.HALF_OPEN) {
      this._successCount++;
      if (this._successCount >= this._options.successThreshold) {
        this._state = CircuitState.CLOSED;
        this._successCount = 0;
        this._logger?.warn(`Circuit breaker [${this._name}] recovered to CLOSED state`);
      }
    }
  }

  private onFailure(): void {
    this._failureCount++;
    this._successCount = 0;

    if (this._failureCount >= this._options.failureThreshold) {
      this._state = CircuitState.OPEN;
      this._nextAttempt = Date.now() + this._options.timeout;
      this._logger?.error(
        `Circuit breaker [${this._name}] tripped to OPEN state after ${this._failureCount} failures. Will retry at ${new Date(this._nextAttempt).toISOString()}`
      );
    }
  }

  getState(): CircuitState {
    return this._state;
  }

  getFailureCount(): number {
    return this._failureCount;
  }

  reset(): void {
    this._state = CircuitState.CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._nextAttempt = Date.now();
  }
}
