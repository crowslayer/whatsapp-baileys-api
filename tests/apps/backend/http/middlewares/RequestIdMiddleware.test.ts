import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestIdMiddleware } from '@apps/backend/http/middlewares/RequestIdMiddleware';

import type { NextFunction, Request, Response } from 'express';

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();

  return {
    ...actual,
    randomUUID: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
  };
});

const VALID_UUID = '22222222-2222-4222-8222-222222222222';

const createReq = (headers: Record<string, string> = {}): Request => {
  const req = {
    header: vi.fn((name: string) => headers[name.toLowerCase()]),
  };

  return req as unknown as Request;
};

const createRes = (): Response => {
  const res = {
    setHeader: vi.fn(),
  };

  return res as unknown as Response;
};

describe('requestIdMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the request id header when it holds a valid uuid', () => {
    const req = createReq({ 'x-request-id': VALID_UUID });
    const res = createRes();

    requestIdMiddleware()(req, res, vi.fn() as unknown as NextFunction);

    expect((req as unknown as { requestId?: string }).requestId).toBe(VALID_UUID);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', VALID_UUID);
  });

  it('uses the correlation id header when it holds a valid uuid', () => {
    const req = createReq({ 'x-correlation-id': VALID_UUID });
    const res = createRes();

    requestIdMiddleware()(req, res, vi.fn() as unknown as NextFunction);

    expect((req as unknown as { correlationId?: string }).correlationId).toBe(VALID_UUID);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', VALID_UUID);
  });

  it('generates a request id when the header is missing', () => {
    const req = createReq();
    const res = createRes();

    requestIdMiddleware()(req, res, vi.fn() as unknown as NextFunction);

    expect((req as unknown as { requestId?: string }).requestId).toBe(
      '11111111-1111-4111-8111-111111111111'
    );
  });

  it('replaces a malformed request id header', () => {
    const req = createReq({ 'x-request-id': 'not-a-uuid' });
    const res = createRes();

    requestIdMiddleware()(req, res, vi.fn() as unknown as NextFunction);

    expect((req as unknown as { requestId?: string }).requestId).toBe(
      '11111111-1111-4111-8111-111111111111'
    );
  });

  it('replaces a malformed correlation id header', () => {
    const req = createReq({ 'x-correlation-id': 'not-a-uuid' });
    const res = createRes();

    requestIdMiddleware()(req, res, vi.fn() as unknown as NextFunction);

    expect((req as unknown as { correlationId?: string }).correlationId).toBe(
      '11111111-1111-4111-8111-111111111111'
    );
  });

  it('falls back to the request id when the correlation id is absent', () => {
    const req = createReq({ 'x-request-id': VALID_UUID });
    const res = createRes();

    requestIdMiddleware()(req, res, vi.fn() as unknown as NextFunction);

    expect((req as unknown as { correlationId?: string }).correlationId).toBe(VALID_UUID);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-Id', VALID_UUID);
  });

  it('sets both correlation headers and calls next', () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn() as unknown as NextFunction;

    requestIdMiddleware()(req, res, next);

    expect(res.setHeader).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
