import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { ValidationError, ValidationItem } from '@shared/domain/error/ValidationError';

describe('ValidationError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an instance of DomainError', () => {
    const error = new ValidationError([]);

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });

  it('builds a summary message from the field and message of every item', () => {
    const items: ValidationItem[] = [
      { field: 'name', message: 'is required' },
      { field: 'age', message: 'must be positive' },
    ];

    const error = new ValidationError(items);

    expect(error.message).toBe('Validation failed: name: is required, age: must be positive');
  });

  it('builds an empty summary message when there are no items', () => {
    const error = new ValidationError([]);

    expect(error.message).toBe('Validation failed: ');
  });

  it('keeps the validation items in the errors property', () => {
    const items: ValidationItem[] = [{ field: 'email', message: 'is invalid' }];

    const error = new ValidationError(items);

    expect(error.errors).toBe(items);
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].field).toBe('email');
  });

  it('uses the validation failed error code', () => {
    const error = new ValidationError([]);

    expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('uses the validation error type', () => {
    const error = new ValidationError([]);

    expect(error.type).toBe(ErrorType.VALIDATION);
  });

  it('uses the class name as error name', () => {
    const error = new ValidationError([]);

    expect(error.name).toBe('ValidationError');
  });

  it('can be thrown and caught with the generated message', () => {
    const thrower = (): never => {
      throw new ValidationError([{ field: 'name', message: 'is required' }]);
    };

    expect(thrower).toThrow(ValidationError);
    expect(thrower).toThrow('Validation failed: name: is required');
  });
});
