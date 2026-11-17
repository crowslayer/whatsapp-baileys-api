import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthMiddleware } from '@apps/backend/http/middlewares/AuthMiddleware';
import { ITokenVerifier } from '@apps/backend/http/validators/token/Index';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

import type { NextFunction, Request, Response } from 'express';

const createReq = (authorization?: string, method = 'GET', path = '/instances'): Request => {
  const req = {
    method,
    path,
    headers: authorization === undefined ? {} : { authorization },
  };

  return req as unknown as Request;
};

const createRes = (): Response => ({}) as unknown as Response;

const createVerifier = (decoded: Record<string, unknown> = { sub: 'user-1' }): ITokenVerifier =>
  ({
    generate: vi.fn(),
    verify: vi.fn().mockReturnValue(decoded),
  }) as unknown as ITokenVerifier;

const asUnauthorizedError = (error: unknown): UnauthorizedError => {
  if (error instanceof UnauthorizedError) return error;
  throw new Error('Expected an UnauthorizedError');
};

describe('AuthMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lets public paths through without verifying the token', async () => {
    const verifier = createVerifier();
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [{ method: 'GET', path: '/instances' }])(
      createReq(undefined, 'GET', '/instances'),
      createRes(),
      next
    );

    expect(next).toHaveBeenCalledWith();
    expect(verifier.verify).not.toHaveBeenCalled();
  });

  it('requires valid authentication when the method does not match the public route', () => {
    const verifier = createVerifier();
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [{ method: 'GET', path: '/instances' }])(
      createReq('Bearer token', 'POST', '/instances'),
      createRes(),
      next
    );

    expect(verifier.verify).toHaveBeenCalledWith('token');
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a request without an authorization header', async () => {
    const verifier = createVerifier();
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [])(createReq(), createRes(), next);

    const error = vi.mocked(next).mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(asUnauthorizedError(error).message).toBe('Missing or malformed Authorization header');
  });

  it('rejects a malformed authorization header', async () => {
    const verifier = createVerifier();
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [])(createReq('token-without-bearer'), createRes(), next);

    const error = vi.mocked(next).mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(asUnauthorizedError(error).message).toBe('Missing or malformed Authorization header');
  });

  it('extracts the token from a bearer header', async () => {
    const verifier = createVerifier();
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [])(createReq('Bearer abc.def.ghi'), createRes(), next);

    expect(verifier.verify).toHaveBeenCalledWith('abc.def.ghi');
    expect(next).toHaveBeenCalledWith();
  });

  it('attaches the authenticated user to the request', async () => {
    const verifier = createVerifier({ sub: 'user-9', iss: 'issuer', aud: 'audience' });
    const next = vi.fn() as unknown as NextFunction;
    const req = createReq('Bearer abc');

    AuthMiddleware.authenticate(verifier, [])(req, createRes(), next);

    const user = (req as unknown as { user?: { userId: string; iss?: string; aud?: unknown } })
      .user;

    expect(user).toEqual({ userId: 'user-9', iss: 'issuer', aud: 'audience' });
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards an UnauthorizedError raised by the verifier', async () => {
    const unauthorized = new UnauthorizedError('token revoked');
    const verifier = {
      generate: vi.fn(),
      verify: vi.fn().mockImplementation(() => {
        throw unauthorized;
      }),
    } as unknown as ITokenVerifier;
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [])(createReq('Bearer abc'), createRes(), next);

    expect(next).toHaveBeenCalledWith(unauthorized);
  });

  it('wraps unexpected verifier errors into an UnauthorizedError', async () => {
    const verifier = {
      generate: vi.fn(),
      verify: vi.fn().mockImplementation(() => {
        throw new Error('boom');
      }),
    } as unknown as ITokenVerifier;
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [])(createReq('Bearer abc'), createRes(), next);

    const error = vi.mocked(next).mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(asUnauthorizedError(error).message).toBe('Invalid or expired token');
  });

  it('rejects a payload without a string subject', async () => {
    const verifier = createVerifier({ sub: 42 });
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [])(createReq('Bearer abc'), createRes(), next);

    const error = vi.mocked(next).mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(asUnauthorizedError(error).message).toBe('Unauthorized user');
  });

  it('rejects a payload with a blank subject', async () => {
    const verifier = createVerifier({ sub: '   ' });
    const next = vi.fn() as unknown as NextFunction;

    AuthMiddleware.authenticate(verifier, [])(createReq('Bearer abc'), createRes(), next);

    const error = vi.mocked(next).mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(asUnauthorizedError(error).message).toBe('Unauthorized user');
  });
});
