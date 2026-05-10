import { UnauthorizedError } from '../../../src/shared/infrastructure/errors/UnauthorizedError';
import { ApplicationError } from '../../../src/shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '../../../src/shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '../../../src/shared/infrastructure/errors/ErrorType';

describe('UnauthorizedError', () => {
  test('should set message via constructor', () => {
    const error = new UnauthorizedError('Access denied');
    expect(error.message).toBe('Access denied');
  });

  test('should have code UNAUTHORIZED (1001)', () => {
    const error = new UnauthorizedError('test');
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  test('should have type ErrorType.AUTHENTICATION', () => {
    const error = new UnauthorizedError('test');
    expect(error.type).toBe(ErrorType.AUTHENTICATION);
  });

  test('should extend ApplicationError', () => {
    const error = new UnauthorizedError('test');
    expect(error).toBeInstanceOf(ApplicationError);
  });

  test('should pass original error', () => {
    const cause = new Error('root');
    const error = new UnauthorizedError('test', cause);
    expect(error.cause).toBe(cause);
  });
});
