import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loggerMiddleware } from '@apps/backend/http/middlewares/LoggerMiddleware';

import { ILogger } from '@shared/domain/Logger';

import type { NextFunction, Request, Response } from 'express';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'generated-uuid'),
}));

const createLogger = (): ILogger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
});

const createRes = (): Response => {
  const res = {
    locals: {} as Record<string, unknown>,
    statusCode: 200,
    on: vi.fn(),
  };

  return res as unknown as Response;
};

describe('loggerMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reuses the request id assigned by a previous middleware', () => {
    const logger = createLogger();
    const req = {
      requestId: 'existing-id',
      method: 'GET',
      path: '/a',
      ip: '1.1.1.1',
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;
    const res = createRes();

    loggerMiddleware(logger)(req, res, vi.fn() as unknown as NextFunction);

    expect(res.locals.requestId).toBe('existing-id');
    expect(res.locals.correlationId).toBe('existing-id');
  });

  it('reuses the correlation id assigned by a previous middleware', () => {
    const logger = createLogger();
    const req = {
      requestId: 'existing-id',
      correlationId: 'existing-correlation',
      method: 'GET',
      path: '/a',
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;
    const res = createRes();

    loggerMiddleware(logger)(req, res, vi.fn() as unknown as NextFunction);

    expect(res.locals.requestId).toBe('existing-id');
    expect(res.locals.correlationId).toBe('existing-correlation');
  });

  it('generates a request id when it is not present', () => {
    const logger = createLogger();
    const req = {
      method: 'GET',
      path: '/a',
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;
    const res = createRes();

    loggerMiddleware(logger)(req, res, vi.fn() as unknown as NextFunction);

    expect(res.locals.requestId).toBe('generated-uuid');
    expect(res.locals.correlationId).toBe('generated-uuid');
  });

  it('logs the request metadata', () => {
    const logger = createLogger();
    const req = {
      method: 'POST',
      path: '/instances',
      ip: '10.0.0.1',
      get: vi.fn().mockReturnValue('jest-agent'),
    } as unknown as Request;
    const res = createRes();

    loggerMiddleware(logger)(req, res, vi.fn() as unknown as NextFunction);

    expect(logger.info).toHaveBeenCalledWith({
      requestId: 'generated-uuid',
      correlationId: 'generated-uuid',
      method: 'POST',
      path: '/instances',
      ip: '10.0.0.1',
      userAgent: 'jest-agent',
    });
  });

  it('calls next synchronously', () => {
    const logger = createLogger();
    const next = vi.fn() as unknown as NextFunction;

    loggerMiddleware(logger)(
      { method: 'GET', path: '/a', get: vi.fn().mockReturnValue(undefined) } as unknown as Request,
      createRes(),
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('logs the response status and duration once the response finishes', () => {
    const logger = createLogger();
    const req = {
      method: 'GET',
      path: '/a',
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;
    const res = createRes();

    loggerMiddleware(logger)(req, res, vi.fn() as unknown as NextFunction);

    const onCall = vi.mocked(res.on).mock.calls[0];

    expect(onCall?.[0]).toBe('finish');

    res.statusCode = 201;
    (onCall?.[1] as () => void)();

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenLastCalledWith({
      requestId: 'generated-uuid',
      correlationId: 'generated-uuid',
      statusCode: 201,
      duration: expect.stringMatching(/^\d+ms$/),
    });
  });
});
