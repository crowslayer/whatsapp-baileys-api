import { ErrorCode } from '../../../../src/shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '../../../../src/shared/infrastructure/errors/ErrorType';
import { ValidationError } from '../../../../src/shared/infrastructure/errors/ValidationError';

describe('ValidationError', () => {
  test('should create with single error', () => {
    const error = new ValidationError([{ field: 'email', message: 'is required' }]);
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0].field).toBe('email');
    expect(error.errors[0].message).toBe('is required');
  });

  test('should create with multiple errors', () => {
    const errors = [
      { field: 'email', message: 'is required' },
      { field: 'name', message: 'must be a string' },
    ];
    const error = new ValidationError(errors);
    expect(error.errors).toHaveLength(2);
  });

  test('should have errors property containing validation items', () => {
    const items = [{ field: 'age', message: 'must be a number' }];
    const error = new ValidationError(items);
    expect(error.errors).toEqual(items);
  });

  test('should have code VALIDATION_FAILED (2001)', () => {
    const error = new ValidationError([{ field: 'x', message: 'y' }]);
    expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
  });

  test('should have type ErrorType.VALIDATION', () => {
    const error = new ValidationError([{ field: 'x', message: 'y' }]);
    expect(error.type).toBe(ErrorType.VALIDATION);
  });

  test('should concatenate field errors in message', () => {
    const error = new ValidationError([
      { field: 'email', message: 'is required' },
      { field: 'name', message: 'too short' },
    ]);
    expect(error.message).toBe('Validation failed: email: is required, name: too short');
  });
});
