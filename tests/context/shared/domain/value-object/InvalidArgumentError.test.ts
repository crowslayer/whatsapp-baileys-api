import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseError } from '@shared/domain/error/BaseError';
import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InvalidArgumentError } from '@shared/domain/value-object/InvalidArgumentError';

describe('InvalidArgumentError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an instance of Error, DomainError and BaseError', () => {
    const error = new InvalidArgumentError('bad argument');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(BaseError);
  });

  it('stores the provided message', () => {
    const error = new InvalidArgumentError('bad argument');

    expect(error.message).toBe('bad argument');
  });

  it('uses the validation failed error code', () => {
    const error = new InvalidArgumentError('bad argument');

    expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('uses the domain violation error type', () => {
    const error = new InvalidArgumentError('bad argument');

    expect(error.type).toBe(ErrorType.DOMAIN_VIOLATION);
  });

  it('uses the class name as error name', () => {
    const error = new InvalidArgumentError('bad argument');

    expect(error.name).toBe('InvalidArgumentError');
  });

  it('exposes a stack trace that does not include the constructor frame', () => {
    const error = new InvalidArgumentError('bad argument');

    expect(typeof error.stack).toBe('string');
    expect(error.stack).not.toBeUndefined();
  });

  it('does not define a cause when none is provided', () => {
    const error = new InvalidArgumentError('bad argument');

    expect(error.cause).toBeUndefined();
  });

  it('can be thrown and caught as a DomainError', () => {
    const thrower = (): never => {
      throw new InvalidArgumentError('thrown');
    };

    expect(thrower).toThrow(DomainError);
    expect(thrower).toThrow('thrown');
  });
});
