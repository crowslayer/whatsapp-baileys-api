import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConcurrencyLimiter } from '@shared/infrastructure/concurrency/ConcurrencyLimiter';

describe('ConcurrencyLimiter', () => {
  let limiter: ConcurrencyLimiter;

  beforeEach(() => {
    vi.clearAllMocks();
    limiter = new ConcurrencyLimiter({ concurrency: 2 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('throws when concurrency is zero', () => {
      expect(() => new ConcurrencyLimiter({ concurrency: 0 })).toThrow(
        'Concurrency must be a positive integer'
      );
    });

    it('throws when concurrency is negative', () => {
      expect(() => new ConcurrencyLimiter({ concurrency: -3 })).toThrow(
        'Concurrency must be a positive integer'
      );
    });

    it('throws when concurrency is not an integer', () => {
      expect(() => new ConcurrencyLimiter({ concurrency: 1.5 })).toThrow(
        'Concurrency must be a positive integer'
      );
    });

    it('throws when concurrency is not a number', () => {
      expect(
        () => new ConcurrencyLimiter({ concurrency: Number.NaN })
      ).toThrow('Concurrency must be a positive integer');
    });
  });

  describe('getters', () => {
    it('exposes the limit and the initial state', () => {
      expect(limiter.limit).toBe(2);
      expect(limiter.runningCount).toBe(0);
      expect(limiter.availableSlots).toBe(2);
      expect(limiter.isFull).toBe(false);
    });

    it('reflects the acquired slots', () => {
      limiter.tryAcquire();

      expect(limiter.runningCount).toBe(1);
      expect(limiter.availableSlots).toBe(1);
      expect(limiter.isFull).toBe(false);
    });
  });

  describe('tryAcquire', () => {
    it('acquires a slot when capacity is available', () => {
      const acquired = limiter.tryAcquire();

      expect(acquired).toBe(true);
      expect(limiter.runningCount).toBe(1);
    });

    it('returns false when the limit is reached', () => {
      limiter.tryAcquire();
      limiter.tryAcquire();

      const acquired = limiter.tryAcquire();

      expect(acquired).toBe(false);
      expect(limiter.runningCount).toBe(2);
      expect(limiter.isFull).toBe(true);
    });
  });

  describe('release', () => {
    it('frees one slot', () => {
      limiter.tryAcquire();
      limiter.tryAcquire();

      limiter.release();

      expect(limiter.runningCount).toBe(1);
      expect(limiter.availableSlots).toBe(1);
    });

    it('does nothing when no slot is acquired', () => {
      limiter.release();

      expect(limiter.runningCount).toBe(0);
      expect(limiter.availableSlots).toBe(2);
    });

    it('never goes below zero', () => {
      limiter.tryAcquire();

      limiter.release();
      limiter.release();
      limiter.release();

      expect(limiter.runningCount).toBe(0);
    });
  });

  describe('execute', () => {
    it('returns the value produced by the task', async () => {
      const result = await limiter.execute(async () => 'value');

      expect(result).toBe('value');
      expect(limiter.runningCount).toBe(0);
    });

    it('releases the slot when the task resolves', async () => {
      await limiter.execute(async () => 'value');

      expect(limiter.availableSlots).toBe(2);
      expect(limiter.isFull).toBe(false);
    });

    it('releases the slot when the task rejects', async () => {
      await expect(
        limiter.execute(async () => {
          throw new Error('task failed');
        })
      ).rejects.toThrow('task failed');
      expect(limiter.runningCount).toBe(0);
    });

    it('throws when the concurrency limit is already reached', async () => {
      limiter.tryAcquire();
      limiter.tryAcquire();

      await expect(limiter.execute(async () => 'value')).rejects.toThrow(
        'Concurrency limit reached'
      );
      expect(limiter.runningCount).toBe(2);
    });

    it('never runs more tasks than the configured concurrency at the same time', async () => {
      let running = 0;
      let maxObserved = 0;
      let releaseGate: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => {
        releaseGate = resolve;
      });
      const task = async (): Promise<string> => {
        running += 1;
        maxObserved = Math.max(maxObserved, running);
        await gate;
        running -= 1;

        return 'done';
      };

      const first = limiter.execute(task);
      const second = limiter.execute(task);
      const third = limiter.execute(task);
      const settledPromise = Promise.allSettled([first, second, third]);

      expect(maxObserved).toBe(2);

      releaseGate();

      const settled = await settledPromise;

      expect(settled[0].status).toBe('fulfilled');
      expect(settled[1].status).toBe('fulfilled');
      expect(settled[2].status).toBe('rejected');
      expect(limiter.runningCount).toBe(0);
    });

    it('executes a delayed task using fake timers', async () => {
      vi.useFakeTimers();

      const pending = limiter.execute(
        () =>
          new Promise<string>((resolve) => {
            setTimeout(() => resolve('timer'), 500);
          })
      );

      expect(limiter.runningCount).toBe(1);

      await vi.advanceTimersByTimeAsync(500);

      await expect(pending).resolves.toBe('timer');
      expect(limiter.runningCount).toBe(0);
    });
  });
});
