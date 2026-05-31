import { ApplicationError } from '../../../../src/shared/infrastructure/errors/ApplicationError';
import { DatabaseError } from '../../../../src/shared/infrastructure/errors/DatabaseError';
import { ErrorCode } from '../../../../src/shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '../../../../src/shared/infrastructure/errors/ErrorType';

class TestDatabaseError extends DatabaseError {
  readonly code = ErrorCode.DB_CONNECTION_FAILED;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}

describe('DatabaseError', () => {
  test('should have type ErrorType.DATABASE', () => {
    const error = new TestDatabaseError('test');
    expect(error.type).toBe(ErrorType.DATABASE);
  });

  test('should extend ApplicationError', () => {
    const error = new TestDatabaseError('test');
    expect(error).toBeInstanceOf(ApplicationError);
  });
});
