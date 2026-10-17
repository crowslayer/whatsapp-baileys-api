import { QueueFullError } from '@infrastructure/concurrency/QueueFullError';

export interface IBoundedQueueOptions {
  maxSize: number;
  concurrency: number;
}

interface IQueueTask<T> {
  execute: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export class BoundedQueue {
  private readonly _maxSize: number;
  private readonly _concurrency: number;
  private readonly _queue: Array<IQueueTask<unknown>> = [];
  private _running = 0;

  // temporales

  constructor(options: IBoundedQueueOptions) {
    if (!Number.isInteger(options.maxSize) || options.maxSize <= 0) {
      throw new Error('maxSize must be a positive integer');
    }

    if (!Number.isInteger(options.concurrency) || options.concurrency <= 0) {
      throw new Error('concurrency must be a positive integer');
    }

    if (options.concurrency > options.maxSize) {
      throw new Error('concurrency cannot be greater than maxSize');
    }

    this._maxSize = options.maxSize;
    this._concurrency = options.concurrency;
  }

  /**
   * Number of tasks waiting in the queue.
   */
  get size(): number {
    return this._queue.length;
  }

  /**
   * Number of tasks currently executing.
   */
  get runningCount(): number {
    return this._running;
  }

  /**
   * Maximum number of tasks that can wait.
   */
  get maxQueueSize(): number {
    return this._maxSize;
  }

  /**
   * Maximum number of concurrent tasks.
   */
  get concurrencyLimit(): number {
    return this._concurrency;
  }

  /**
   * Remaining queue capacity.
   */
  get availableQueueCapacity(): number {
    return Math.max(0, this._maxSize - this._queue.length);
  }

  /**
   * Indicates whether the waiting queue is full.
   */
  get isFull(): boolean {
    return this._queue.length >= this._maxSize;
  }

  /**
   * Indicates whether there are no waiting tasks.
   */
  get isEmpty(): boolean {
    return this._queue.length === 0;
  }

  /**
   * Adds a task to the queue.
   *
   * If the queue is full, the task is rejected immediately.
   */
  add<T>(task: () => Promise<T>): Promise<T> {
    if (this.isFull) {
      return Promise.reject(new QueueFullError());
    }

    return new Promise<T>((resolve, reject) => {
      this._queue.push({
        execute: task,
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      this.process();
    });
  }

  /**
   * Starts as many queued tasks as the concurrency limit allows.
   */
  private process(): void {
    while (this._running < this._concurrency && this._queue.length > 0) {
      const task = this._queue.shift();

      if (!task) {
        return;
      }

      this._running += 1;

      void this.execute(task);
    }
  }

  private async execute<T>(task: IQueueTask<T>): Promise<void> {
    try {
      const result = await task.execute();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this._running -= 1;

      this.process();
    }
  }

  /**
   * Rejects all tasks waiting in the queue.
   *
   * Running tasks are not cancelled.
   */
  clear(reason: unknown = new Error('Request queue cleared')): void {
    while (this._queue.length > 0) {
      const task = this._queue.shift();

      task?.reject(reason);
    }
  }
}
