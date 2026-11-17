import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';
import { QueryNotRegisteredError } from '@shared/infrastructure/query-bus/QueryNotRegisteredError';

describe('QueryNotRegisteredError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an infrastructure error', () => {
    const error = new QueryNotRegisteredError('GetUserQuery');

    expect(error).toBeInstanceOf(QueryNotRegisteredError);
    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error).toBeInstanceOf(Error);
  });

  it('exposes the QUERY_HANDLER_NOT_FOUND error code', () => {
    const error = new QueryNotRegisteredError('GetUserQuery');

    expect(error.code).toBe(ErrorCode.QUERY_HANDLER_NOT_FOUND);
  });

  it('exposes the infrastructure error type', () => {
    const error = new QueryNotRegisteredError('GetUserQuery');

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('builds the message with the query name', () => {
    const error = new QueryNotRegisteredError('GetUserQuery');

    expect(error.message).toBe('GetUserQuery');
  });

  it('uses the class name as error name', () => {
    const error = new QueryNotRegisteredError('GetUserQuery');

    expect(error.name).toBe('QueryNotRegisteredError');
  });

  it('supports the cause option', () => {
    const cause = new Error('root cause');

    const error = new QueryNotRegisteredError('GetUserQuery', { cause });

    expect(error.cause).toBe(cause);
  });
});
