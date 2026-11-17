import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseError } from '@shared/domain/error/BaseError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

class CustomError extends BaseError {
  readonly code: ErrorCode = ErrorCode.INTERNAL_ERROR;
  readonly type: ErrorType = ErrorType.INTERNAL;
}

describe('BaseError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an instance of Error', () => {
    const error = new CustomError('failure');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
  });

  it('stores the provided message', () => {
    const error = new CustomError('failure');

    expect(error.message).toBe('failure');
  });

  it('uses the concrete class name as error name', () => {
    const error = new CustomError('failure');

    expect(error.name).toBe('CustomError');
  });

  it('exposes the code declared by the concrete class', () => {
    const error = new CustomError('failure');

    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('exposes the type declared by the concrete class', () => {
    const error = new CustomError('failure');

    expect(error.type).toBe(ErrorType.INTERNAL);
  });

  it('stores the cause when it is provided', () => {
    const cause = new Error('root cause');
    const error = new CustomError('failure', { cause });

    expect(error.cause).toBe(cause);
  });

  it('does not define a cause when it is not provided', () => {
    const error = new CustomError('failure');

    expect(error.cause).toBeUndefined();
  });

  it('captures a stack trace that starts with the error name and message', () => {
    const error = new CustomError('failure');

    expect(typeof error.stack).toBe('string');
    expect(error.stack?.startsWith('CustomError: failure')).toBe(true);
  });

  it('restores the prototype chain so instanceof works for subclasses', () => {
    const error = new CustomError('failure');

    expect(Object.getPrototypeOf(error)).toBe(CustomError.prototype);
    expect(error instanceof CustomError).toBe(true);
  });

  it('can be thrown and caught preserving the message', () => {
    const thrower = (): never => {
      throw new CustomError('thrown');
    };

    expect(thrower).toThrow(CustomError);
    expect(thrower).toThrow('thrown');
  });
});
