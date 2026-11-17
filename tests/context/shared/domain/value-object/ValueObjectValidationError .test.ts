import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import {
  IValidationErrorDetail,
  ValueObjectValidationError,
} from '@shared/domain/value-object/ValueObjectValidationError ';

describe('ValueObjectValidationError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is an instance of Error', () => {
    const error = new ValueObjectValidationError('invalid');

    expect(error).toBeInstanceOf(Error);
  });

  it('uses the validation failed error code', () => {
    const error = new ValueObjectValidationError('invalid');

    expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('uses the class name as error name', () => {
    const error = new ValueObjectValidationError('invalid');

    expect(error.name).toBe('ValueObjectValidationError');
  });

  it('keeps the message when a string is provided', () => {
    const error = new ValueObjectValidationError('value is required');

    expect(error.message).toBe('value is required');
  });

  it('wraps a string error into a detail using the default field name', () => {
    const error = new ValueObjectValidationError('value is required');

    expect(error.errors).toEqual([{ field: 'value', message: 'value is required' }]);
  });

  it('wraps a string error into a detail using the provided field name', () => {
    const error = new ValueObjectValidationError('value is required', 'email');

    expect(error.errors).toEqual([{ field: 'email', message: 'value is required' }]);
  });

  it('builds a summary message joining the detail messages', () => {
    const details: IValidationErrorDetail[] = [
      { field: 'name', message: 'is required' },
      { field: 'age', message: 'must be positive' },
    ];

    const error = new ValueObjectValidationError(details);

    expect(error.message).toBe('Validation failed: is required, must be positive');
  });

  it('keeps the detail list when an array is provided', () => {
    const details: IValidationErrorDetail[] = [
      { field: 'name', message: 'is required' },
      { field: 'age', message: 'must be positive' },
    ];

    const error = new ValueObjectValidationError(details);

    expect(error.errors).toBe(details);
    expect(error.errors).toHaveLength(2);
  });

  it('keeps an empty detail list when an empty array is provided', () => {
    const error = new ValueObjectValidationError([]);

    expect(error.errors).toEqual([]);
    expect(error.message).toBe('Validation failed: ');
  });

  it('can be thrown and caught with the provided message', () => {
    const thrower = (): never => {
      throw new ValueObjectValidationError('boom');
    };

    expect(thrower).toThrow(ValueObjectValidationError);
    expect(thrower).toThrow('boom');
  });
});
