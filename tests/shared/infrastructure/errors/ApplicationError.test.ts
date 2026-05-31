import { ApplicationError } from '../../../../src/shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '../../../../src/shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '../../../../src/shared/infrastructure/errors/ErrorType';

class TestApplicationError extends ApplicationError {
  readonly code = ErrorCode.INTERNAL_ERROR;
  readonly type = ErrorType.INTERNAL;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}

describe('ApplicationError', () => {
  test('should set message via constructor', () => {
    const error = new TestApplicationError('test message');
    expect(error.message).toBe('test message');
  });

  test('should set cause when provided', () => {
    const cause = new Error('root cause');
    const error = new TestApplicationError('test message', cause);
    expect(error.cause).toBe(cause);
  });

  test('should have abstract code property', () => {
    const error = new TestApplicationError('test');
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  test('should have abstract type property', () => {
    const error = new TestApplicationError('test');
    expect(error.type).toBe(ErrorType.INTERNAL);
  });

  test('should set name to subclass name', () => {
    const error = new TestApplicationError('test');
    expect(error.name).toBe('TestApplicationError');
  });
});
