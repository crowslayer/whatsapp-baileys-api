import { setTimeout as delay } from 'node:timers/promises';

type Task<T> = () => Promise<T>;

interface IRateLimiterOptions {
  concurrency?: number; // cuántas tareas en paralelo
  minDelayMs?: number; // delay mínimo entre ejecuciones
  maxRetries?: number; // reintentos automáticos
  retryDelayMs?: number; // delay base para retry
}

interface IQueueItem<T> {
  task: Task<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  retries: number;
}

export class BaileysRateLimiter {
  private _queue: IQueueItem<unknown>[] = [];

  private _running = 0;
  private _lastExecution = 0;

  private readonly _concurrency: number;
  private readonly _minDelayMs: number;
  private readonly _maxRetries: number;
  private readonly _retryDelayMs: number;

  constructor(options?: IRateLimiterOptions) {
    this._concurrency = options?.concurrency ?? 3;
    this._minDelayMs = options?.minDelayMs ?? 300;
    this._maxRetries = options?.maxRetries ?? 2;
    this._retryDelayMs = options?.retryDelayMs ?? 500;
  }
  // eslint-disable-next-line
  async run<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: IQueueItem<T> = {
        task,
        resolve,
        reject,
        retries: 0,
      };

      this._queue.push(item as IQueueItem<unknown>);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this._running >= this._concurrency) return;
    if (this._queue.length === 0) return;

    const now = Date.now();
    const timeSinceLast = now - this._lastExecution;

    if (timeSinceLast < this._minDelayMs) {
      await delay(this._minDelayMs - timeSinceLast);
      return;
    }

    const item = this._queue.shift();
    if (!item) return;

    this._running++;
    this._lastExecution = Date.now();

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      if (item.retries < this._maxRetries) {
        item.retries++;

        await delay(this._retryDelayMs * item.retries);
        this._queue.unshift(item);
      } else {
        item.reject(error);
      }
    } finally {
      this._running--;
      this.processQueue();
    }
  }

  getQueueSize(): number {
    return this._queue.length;
  }

  getRunningCount(): number {
    return this._running;
  }
}
