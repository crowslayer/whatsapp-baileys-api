import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StatusCode } from '@shared/infrastructure/http/status/StatusCode';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import type { ErrorContent } from '@shared/infrastructure/http/response/HttpResponse';
import type { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';

const getErrors = (response: HttpResponse<unknown>): ErrorContent[] => {
  if ('errors' in response.body) return response.body.errors;
  throw new Error('Expected an error response body');
};

describe('ResponseBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds a 200 response for the ok factory', () => {
    const response = ResponseBuilder.ok({ id: 1 });

    expect(response.body).toEqual({
      success: true,
      status: StatusCode.SuccessOK,
      content: { id: 1 },
    });
  });

  it('builds a 201 response for the created factory', () => {
    const response = ResponseBuilder.created({ id: 1 });

    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe(StatusCode.SuccessCreated);
    expect(response.body.content).toEqual({ id: 1 });
  });

  it('builds a 202 response for the accepted factory', () => {
    const response = ResponseBuilder.accepted({ queued: true });

    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe(StatusCode.SuccessAccepted);
    expect(response.body.content).toEqual({ queued: true });
  });

  it('builds a 204 response with null content for the noContent factory', () => {
    const response = ResponseBuilder.noContent();

    expect(response.body).toEqual({
      success: true,
      status: StatusCode.SuccessNoContent,
      content: null,
    });
  });

  it('does not attach headers nor cookies to the built responses', () => {
    const response = ResponseBuilder.ok('payload');

    expect(response.headers).toBeUndefined();
    expect(response.cookies).toBeUndefined();
  });

  it('builds an error response with a 400 status by default', () => {
    const errors: ErrorContent[] = [
      {
        code: 2002,
        type: 'validation_error',
        name: 'ValidationError',
        description: 'name is required',
      },
    ];

    const response = ResponseBuilder.error(errors);

    expect(response.body).toEqual({
      success: false,
      status: StatusCode.ClientErrorBadRequest,
      errors,
      content: null,
    });
  });

  it('builds an error response with a custom status', () => {
    const errors: ErrorContent[] = [
      {
        code: 3002,
        type: 'database_failure',
        name: 'DatabaseUniqueConstraintError',
        description: 'duplicate',
      },
    ];

    const response = ResponseBuilder.error(errors, StatusCode.ClientErrorConflict);

    expect(response.body.status).toBe(StatusCode.ClientErrorConflict);
    expect(response.body.success).toBe(false);
    expect(response.body.content).toBeNull();
  });

  it('builds an error response with an empty errors collection', () => {
    const response = ResponseBuilder.error([]);

    expect(response.body.success).toBe(false);
    expect(getErrors(response)).toEqual([]);
  });

  it('allows any content type on success responses', () => {
    const primitive = ResponseBuilder.ok('text');
    const nullable = ResponseBuilder.ok(null);
    const list = ResponseBuilder.ok([1, 2, 3]);

    expect(primitive.body.content).toBe('text');
    expect(nullable.body.content).toBeNull();
    expect(list.body.content).toEqual([1, 2, 3]);
  });
});
