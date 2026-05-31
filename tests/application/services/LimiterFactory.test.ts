import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  limiterCtor: vi.fn(),
}));

vi.mock('@infrastructure/baileys/BaileysRateLimiter', () => ({
  BaileysRateLimiter: class {
    constructor(options: unknown) {
      mocks.limiterCtor(options);
    }
  },
}));

import { LimiterFactory } from '../../../src/application/services/LimiterFactory';

describe('LimiterFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a limiter for a new instance', () => {
    const factory = new LimiterFactory();

    const limiter = factory.getLimiter('instance-1');

    expect(limiter).toBeDefined();
    expect(mocks.limiterCtor).toHaveBeenCalledTimes(1);
  });

  it('should reuse limiter for the same instance', () => {
    const factory = new LimiterFactory();

    const limiter1 = factory.getLimiter('instance-1');
    const limiter2 = factory.getLimiter('instance-1');

    expect(limiter1).toBe(limiter2);
    expect(mocks.limiterCtor).toHaveBeenCalledTimes(1);
  });

  it('should create different limiters for different instances', () => {
    const factory = new LimiterFactory();

    const limiter1 = factory.getLimiter('instance-1');
    const limiter2 = factory.getLimiter('instance-2');

    expect(limiter1).not.toBe(limiter2);
    expect(mocks.limiterCtor).toHaveBeenCalledTimes(2);
  });

  it('should create limiter with expected configuration', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const factory = new LimiterFactory();

    factory.getLimiter('instance-1');

    expect(mocks.limiterCtor).toHaveBeenCalledWith({
      concurrency: 1,
      minDelayMs: 400,
    });
  });

  it('should calculate minDelayMs using random value', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1);

    const factory = new LimiterFactory();

    factory.getLimiter('instance-1');

    expect(mocks.limiterCtor).toHaveBeenCalledWith({
      concurrency: 1,
      minDelayMs: 700,
    });
  });
});
