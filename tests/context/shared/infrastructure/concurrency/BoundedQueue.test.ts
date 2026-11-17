import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BoundedQueue } from '@shared/infrastructure/concurrency/BoundedQueue';
import { QueueFullError } from '@shared/infrastructure/concurrency/QueueFullError';

interface IDeferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): IDeferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('BoundedQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('throws when maxSize is zero', () => {
      expect(() => new BoundedQueue({ maxSize: 0, concurrency: 1 })).toThrow(
        'maxSize must be a positive integer'
      );
    });

    it('throws when maxSize is negative', () => {
      expect(() => new BoundedQueue({ maxSize: -1, concurrency: 1 })).toThrow(
        'maxSize must be a positive integer'
      );
    });

    it('throws when maxSize is not an integer', () => {
      expect(() => new BoundedQueue({ maxSize: 1.5, concurrency: 1 })).toThrow(
        'maxSize must be a positive integer'
      );
    });

    it('throws when concurrency is zero', () => {
      expect(() => new BoundedQueue({ maxSize: 5, concurrency: 0 })).toThrow(
        'concurrency must be a positive integer'
      );
    });

    it('throws when concurrency is not an integer', () => {
      expect(() => new BoundedQueue({ maxSize: 5, concurrency: 2.5 })).toThrow(
        'concurrency must be a positive integer'
      );
    });

    it('throws when concurrency is greater than maxSize', () => {
      expect(() => new BoundedQueue({ maxSize: 2, concurrency: 3 })).toThrow(
        'concurrency cannot be greater than maxSize'
      );
    });
  });

  describe('getters', () => {
    it('exposes the configured limits', () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 3 });

      expect(queue.maxQueueSize).toBe(10);
      expect(queue.concurrencyLimit).toBe(3);
      expect(queue.size).toBe(0);
      expect(queue.runningCount).toBe(0);
      expect(queue.availableQueueCapacity).toBe(10);
      expect(queue.isEmpty).toBe(true);
      expect(queue.isFull).toBe(false);
    });
  });

  describe('add', () => {
    it('resolves the returned promise with the task result', async () => {
      const queue = new BoundedQueue({ maxSize: 5, concurrency: 2 });

      const result = await queue.add(async () => 'done');

      expect(result).toBe('done');
    });

    it('rejects the returned promise when the task throws', async () => {
      const queue = new BoundedQueue({ maxSize: 5, concurrency: 2 });
      const failure = new Error('task failed');

      await expect(
        queue.add(async () => {
          throw failure;
        })
      ).rejects.toThrow(failure);
    });

    it('rejects with a QueueFullError when the waiting queue is full', async () => {
      const queue = new BoundedQueue({ maxSize: 1, concurrency: 1 });
      const deferred = createDeferred<string>();

      const running = queue.add(() => deferred.promise);
      const waiting = queue.add(() => deferred.promise);

      await expect(queue.add(async () => 'overflow')).rejects.toThrow(QueueFullError);
      await expect(queue.add(async () => 'overflow')).rejects.toThrow(
        'Queue is full'
      );

      deferred.resolve('ok');

      await expect(running).resolves.toBe('ok');
      await expect(waiting).resolves.toBe('ok');
    });

    it('never runs more tasks than the concurrency limit', async () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 2 });
      const first = createDeferred<string>();
      const second = createDeferred<string>();
      const third = createDeferred<string>();

      const firstResult = queue.add(() => first.promise);
      const secondResult = queue.add(() => second.promise);
      const thirdResult = queue.add(() => third.promise);

      expect(queue.runningCount).toBe(2);
      expect(queue.size).toBe(1);

      first.resolve('first');

      await expect(firstResult).resolves.toBe('first');
      expect(queue.runningCount).toBe(2);
      expect(queue.size).toBe(0);

      second.resolve('second');
      third.resolve('third');

      await expect(secondResult).resolves.toBe('second');
      await expect(thirdResult).resolves.toBe('third');
      expect(queue.runningCount).toBe(0);
    });

    it('processes the queued tasks in FIFO order once a slot is freed', async () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 1 });
      const order: string[] = [];
      const first = createDeferred<string>();

      const firstResult = queue.add(async () => {
        order.push('first');

        return first.promise;
      });
      const secondResult = queue.add(async () => {
        order.push('second');

        return 'second';
      });

      expect(order).toEqual(['first']);

      first.resolve('first');

      await expect(firstResult).resolves.toBe('first');
      await expect(secondResult).resolves.toBe('second');
      expect(order).toEqual(['first', 'second']);
    });

    it('releases the slot when a running task rejects', async () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 1 });

      await expect(
        queue.add(async () => {
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');
      expect(queue.runningCount).toBe(0);
      expect(queue.availableQueueCapacity).toBe(10);
    });

    it('executes a delayed task using fake timers', async () => {
      vi.useFakeTimers();
      const queue = new BoundedQueue({ maxSize: 5, concurrency: 1 });

      const pending = queue.add(
        () =>
          new Promise<string>((resolve) => {
            setTimeout(() => resolve('timer'), 1000);
          })
      );

      expect(queue.runningCount).toBe(1);

      await vi.advanceTimersByTimeAsync(1000);

      await expect(pending).resolves.toBe('timer');
      expect(queue.runningCount).toBe(0);
    });
  });

  describe('clear', () => {
    it('rejects every waiting task with the default reason', async () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 1 });
      const deferred = createDeferred<string>();

      const running = queue.add(() => deferred.promise);
      const waiting = queue.add(() => deferred.promise);

      expect(queue.size).toBe(1);

      queue.clear();

      expect(queue.size).toBe(0);
      await expect(waiting).rejects.toThrow('Request queue cleared');

      deferred.resolve('ok');

      await expect(running).resolves.toBe('ok');
    });

    it('rejects every waiting task with a custom reason', async () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 1 });
      const deferred = createDeferred<string>();
      const reason = new Error('shutdown');

      const running = queue.add(() => deferred.promise);
      const waiting = queue.add(() => deferred.promise);

      queue.clear(reason);

      await expect(waiting).rejects.toThrow(reason);

      deferred.resolve('ok');

      await expect(running).resolves.toBe('ok');
    });

    it('does not cancel the running tasks', async () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 1 });
      const deferred = createDeferred<string>();

      const running = queue.add(() => deferred.promise);

      queue.clear();

      expect(queue.runningCount).toBe(1);

      deferred.resolve('still running');

      await expect(running).resolves.toBe('still running');
    });

    it('is a no-op when the queue is empty', () => {
      const queue = new BoundedQueue({ maxSize: 10, concurrency: 1 });

      expect(() => queue.clear()).not.toThrow();
      expect(queue.size).toBe(0);
    });
  });
});
