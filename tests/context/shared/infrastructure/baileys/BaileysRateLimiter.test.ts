import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn(async () => undefined) }));

import { BaileysRateLimiter } from '@shared/infrastructure/baileys/BaileysRateLimiter';

describe('BaileysRateLimiter', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('runs queued tasks and reports its idle state when complete', async () => {
    // Arrange
    const limiter = new BaileysRateLimiter({ concurrency: 1, minDelayMs: 0 });
    const first = vi.fn(async () => 'first');
    const second = vi.fn(async () => 'second');

    // Act
    const results = await Promise.all([limiter.run(first), limiter.run(second)]);

    // Assert
    expect(results).toEqual(['first', 'second']);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    expect(limiter.getQueueSize()).toBe(0);
    expect(limiter.getRunningCount()).toBe(0);
  });

  it('retries a task up to the configured limit and then rejects', async () => {
    // Arrange
    const limiter = new BaileysRateLimiter({ concurrency: 1, minDelayMs: 0, maxRetries: 2, retryDelayMs: 0 });
    const failure = new Error('temporary failure');
    const task = vi.fn<() => Promise<string>>().mockRejectedValue(failure);

    // Act / Assert
    await expect(limiter.run(task)).rejects.toBe(failure);
    expect(task).toHaveBeenCalledTimes(3);
  });
});
