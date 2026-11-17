import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseError } from '@shared/domain/error/BaseError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

class StorageError extends InfrastructureError {
  readonly code: ErrorCode = ErrorCode.DATABASE_ERROR;
}

describe('InfrastructureError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an instance of BaseError', () => {
    const error = new StorageError('storage down');

    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(InfrastructureError);
  });

  it('stores the provided message', () => {
    const error = new StorageError('storage down');

    expect(error.message).toBe('storage down');
  });

  it('uses the infrastructure error type', () => {
    const error = new StorageError('storage down');

    expect(error.type).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('exposes the code declared by the concrete class', () => {
    const error = new StorageError('storage down');

    expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
  });

  it('uses the concrete class name as error name', () => {
    const error = new StorageError('storage down');

    expect(error.name).toBe('StorageError');
  });

  it('supports a cause through the base constructor', () => {
    const cause = new Error('root cause');
    const error = new StorageError('storage down', { cause });

    expect(error.cause).toBe(cause);
  });
});
