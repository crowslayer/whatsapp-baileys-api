import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackpressureMiddleware } from '@apps/backend/http/middlewares/BackpressureMiddleware';

import { QueueFullError } from '@shared/infrastructure/concurrency/QueueFullError';
import { ServiceOverloadedError } from '@shared/infrastructure/errors/ServiceOverloadError';

import type { NextFunction, Request, Response } from 'express';

const { queueMock, boundedQueueConstructor } = vi.hoisted(() => {
  const instance = {
    add: vi.fn(),
    size: 0,
    maxQueueSize: 500,
  };

  const boundedQueueConstructor = vi.fn(function (this: typeof instance) {
    Object.assign(this, instance);
  });

  return { queueMock: instance, boundedQueueConstructor };
});

vi.mock('@shared/infrastructure/concurrency/BoundedQueue', () => ({
  BoundedQueue: boundedQueueConstructor,
}));

const createRes = (): Response => {
  const res = {
    once: vi.fn(),
  };

  return res as unknown as Response;
};

const asOverloadedError = (error: unknown): ServiceOverloadedError => {
  if (error instanceof ServiceOverloadedError) return error;
  throw new Error('Expected a ServiceOverloadedError');
};

describe('BackpressureMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queueMock.size = 0;
    queueMock.maxQueueSize = 500;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a bounded queue with the expected limits', () => {
    BackpressureMiddleware.concurrencyLimiter();

    expect(boundedQueueConstructor).toHaveBeenCalledWith({ maxSize: 500, concurrency: 30 });
  });

  it('runs the task through the queue and calls next', async () => {
    queueMock.add.mockImplementation((task: () => Promise<void>) => task());
    const next = vi.fn() as unknown as NextFunction;

    BackpressureMiddleware.concurrencyLimiter()(
      {} as Request,
      createRes(),
      next
    );

    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1));

    expect(queueMock.add).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('resolves the queued task when the response finishes', async () => {
    queueMock.add.mockImplementation((task: () => Promise<void>) => task());
    const next = vi.fn() as unknown as NextFunction;
    const res = createRes();

    BackpressureMiddleware.concurrencyLimiter()({} as Request, res, next);

    await vi.waitFor(() => expect(res.once).toHaveBeenCalledTimes(2));

    expect(vi.mocked(res.once).mock.calls[0]?.[0]).toBe('finish');
    expect(vi.mocked(res.once).mock.calls[1]?.[0]).toBe('close');
    const finish = vi.mocked(res.once).mock.calls[0]?.[1];
    expect(finish).toBeTypeOf('function');
    if (typeof finish === 'function') finish();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('translates a queue overflow into a ServiceOverloadedError', async () => {
    queueMock.add.mockRejectedValue(new QueueFullError('Queue is full'));
    const next = vi.fn() as unknown as NextFunction;

    BackpressureMiddleware.concurrencyLimiter()({} as Request, createRes(), next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1));

    const error = vi.mocked(next).mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(ServiceOverloadedError);
    expect(asOverloadedError(error).retryAfter).toBeGreaterThanOrEqual(1);
    expect(asOverloadedError(error).retryAfter).toBeLessThanOrEqual(30);
  });

  it('computes the retry after from the current queue saturation', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    queueMock.size = 500;
    queueMock.maxQueueSize = 500;
    queueMock.add.mockRejectedValue(new QueueFullError('Queue is full'));
    const next = vi.fn() as unknown as NextFunction;

    BackpressureMiddleware.concurrencyLimiter()({} as Request, createRes(), next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1));

    const error = asOverloadedError(vi.mocked(next).mock.calls[0]?.[0]);

    expect(error.retryAfter).toBeGreaterThanOrEqual(2);
    expect(error.retryAfter).toBeLessThanOrEqual(30);
  });

  it('forwards unexpected queue errors untouched', async () => {
    const failure = new Error('unexpected');
    queueMock.add.mockRejectedValue(failure);
    const next = vi.fn() as unknown as NextFunction;

    BackpressureMiddleware.concurrencyLimiter()({} as Request, createRes(), next);

    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1));

    expect(next).toHaveBeenCalledWith(failure);
  });
});
