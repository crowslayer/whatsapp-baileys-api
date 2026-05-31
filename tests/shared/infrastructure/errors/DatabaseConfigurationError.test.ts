import { DatabaseConfigurationError } from '../../../../src/shared/infrastructure/errors/DatabaseConfigurationError';
import { DatabaseError } from '../../../../src/shared/infrastructure/errors/DatabaseError';
import { ErrorCode } from '../../../../src/shared/infrastructure/errors/ErrorCode';

describe('DatabaseConfigurationError', () => {
  test('should have message "Database Configuration error"', () => {
    const error = new DatabaseConfigurationError();
    expect(error.message).toBe('Database Configuration error');
  });

  test('should have code DB_CONNECTION_FAILED (3001)', () => {
    const error = new DatabaseConfigurationError();
    expect(error.code).toBe(ErrorCode.DB_CONNECTION_FAILED);
  });

  test('should extend DatabaseError', () => {
    const error = new DatabaseConfigurationError();
    expect(error).toBeInstanceOf(DatabaseError);
  });
});
