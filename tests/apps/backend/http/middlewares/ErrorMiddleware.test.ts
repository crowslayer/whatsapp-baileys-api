import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StatusCode } from '@apps/backend/http/StatusCode';
import { errorMiddleware } from '@apps/backend/http/middlewares/ErrorMiddleware';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { ValidationError } from '@shared/domain/error/ValidationError';
import { ILogger } from '@shared/domain/Logger';
import { ServiceOverloadedError } from '@shared/infrastructure/errors/ServiceOverloadError';
import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';
import { ExpressResponseAdapter } from '@shared/infrastructure/http/express/ExpressResponseAdapter';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';

import type { NextFunction, Request, Response } from 'express';

vi.mock('@shared/infrastructure/http/express/ExpressResponseAdapter', () => ({
  ExpressResponseAdapter: {
    send: vi.fn(),
  },
}));

const createLogger = (): ILogger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
});

const createReq = (): Request =>
  ({
    path: '/instances',
    method: 'GET',
    requestId: 'req-1',
    correlationId: 'corr-1',
    headers: {},
  }) as unknown as Request;

const createRes = (headersSent = false): Response =>
  ({
    headersSent,
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
    cookie: vi.fn(),
  }) as unknown as Response;

const lastResponse = (): HttpResponse<unknown> => {
  const calls = vi.mocked(ExpressResponseAdapter.send).mock.calls;

  return calls[calls.length - 1]?.[2] as HttpResponse<unknown>;
};

const getErrors = (response: HttpResponse<unknown>): unknown[] => {
  if ('errors' in response.body) return response.body.errors;
  throw new Error('Expected an error response body');
};

describe('errorMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to next when the response headers were already sent', () => {
    const logger = createLogger();
    const error = new Error('late failure');
    const next = vi.fn() as unknown as NextFunction;

    errorMiddleware(logger)(error, createReq(), createRes(true), next);

    expect(next).toHaveBeenCalledWith(error);
    expect(vi.mocked(ExpressResponseAdapter.send)).not.toHaveBeenCalled();
  });

  it('logs the captured error with the request context', () => {
    const logger = createLogger();

    errorMiddleware(logger)(new Error('boom'), createReq(), createRes(), vi.fn() as NextFunction);

    expect(logger.error).toHaveBeenCalledTimes(1);
    const context = vi.mocked(logger.error).mock.calls[0]?.[1] as Record<string, unknown>;

    expect(context.path).toBe('/instances');
    expect(context.method).toBe('GET');
    expect(context.requestId).toBe('req-1');
    expect(context.correlationId).toBe('corr-1');
  });

  it('answers with 400 when the request body contains invalid json', () => {
    errorMiddleware(createLogger())(
      { type: 'entity.parse.failed' },
      createReq(),
      createRes(),
      vi.fn() as NextFunction
    );

    const response = lastResponse();

    expect(response.body.status).toBe(StatusCode.ClientErrorBadRequest);
    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.INTERNAL_ERROR,
        type: ErrorType.INTERNAL,
        name: 'Invalid JSON',
        description: 'Request body contains invalid JSON',
      },
    ]);
  });

  it('answers with 413 when the payload is too large', () => {
    errorMiddleware(createLogger())(
      { type: 'entity.too.large' },
      createReq(),
      createRes(),
      vi.fn() as NextFunction
    );

    const response = lastResponse();

    expect(response.body.status).toBe(StatusCode.ClientErrorPayloadTooLarge);
    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.INTERNAL_ERROR,
        type: ErrorType.INTERNAL,
        name: 'Payload Too Large',
        description: 'Request body exceeds the allowed size',
      },
    ]);
  });

  it('answers with 500 and a generic payload for unknown errors', () => {
    errorMiddleware(createLogger())(
      new Error('unexpected'),
      createReq(),
      createRes(),
      vi.fn() as NextFunction
    );

    const response = lastResponse();

    expect(response.body.status).toBe(StatusCode.ServerErrorInternal);
    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.INTERNAL_ERROR,
        type: ErrorType.INTERNAL,
        name: 'Unknown Error',
        description: 'Unexpected error occurred',
      },
    ]);
  });

  it('answers with 500 for a non error value', () => {
    errorMiddleware(createLogger())('a string', createReq(), createRes(), vi.fn() as NextFunction);

    const response = lastResponse();

    expect(response.body.status).toBe(StatusCode.ServerErrorInternal);
    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.INTERNAL_ERROR,
        type: ErrorType.INTERNAL,
        name: 'Unknown Error',
        description: 'Unexpected error occurred',
      },
    ]);
  });

  it('exposes the unauthorized error details in the payload', () => {
    errorMiddleware(createLogger())(
      new UnauthorizedError('missing token'),
      createReq(),
      createRes(),
      vi.fn() as NextFunction
    );

    const response = lastResponse();

    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.UNAUTHORIZED,
        type: ErrorType.UNAUTHORIZED,
        name: 'UnauthorizedError',
        description: 'missing token',
      },
    ]);
  });

  it('exposes the service overloaded error details in the payload', () => {
    errorMiddleware(createLogger())(
      new ServiceOverloadedError(30),
      createReq(),
      createRes(),
      vi.fn() as NextFunction
    );

    const response = lastResponse();

    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.LIMIT_EXCEEDED,
        type: ErrorType.INFRASTRUCTURE,
        name: 'ServiceOverloadedError',
        description: 'Service temporarily overloaded',
      },
    ]);
  });

  it('exposes the whatsapp connection error details in the payload', () => {
    errorMiddleware(createLogger())(
      new WhatsAppConnectionError('connection lost'),
      createReq(),
      createRes(),
      vi.fn() as NextFunction
    );

    const response = lastResponse();

    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.SERVICE_UNAVAILABLE,
        type: ErrorType.INFRASTRUCTURE,
        name: 'WhatsAppConnectionError',
        description: 'connection lost',
      },
    ]);
  });

  it('maps every validation error into the response payload', () => {
    const validationError = new ValidationError([
      { field: 'name', message: 'Name is required' },
      { field: 'phoneNumber', message: 'Phone number malformed' },
    ]);

    errorMiddleware(createLogger())(
      validationError,
      createReq(),
      createRes(),
      vi.fn() as NextFunction
    );

    const response = lastResponse();

    expect(getErrors(response)).toEqual([
      {
        code: ErrorCode.VALIDATION_FAILED,
        type: ErrorType.VALIDATION,
        name: 'name',
        description: 'Name is required',
      },
      {
        code: ErrorCode.VALIDATION_FAILED,
        type: ErrorType.VALIDATION,
        name: 'phoneNumber',
        description: 'Phone number malformed',
      },
    ]);
  });
});
