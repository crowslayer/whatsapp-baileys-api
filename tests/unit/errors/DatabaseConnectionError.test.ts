import { DatabaseConnectionError } from '../../../src/shared/infrastructure/errors/DatabaseConnectionError';
import { DatabaseError } from '../../../src/shared/infrastructure/errors/DatabaseError';
import { ErrorCode } from '../../../src/shared/infrastructure/errors/ErrorCode';

describe('DatabaseConnectionError', () => {
  test('should have message "Database connection error"', () => {
    const error = new DatabaseConnectionError();
    expect(error.message).toBe('Database connection error');
  });

  test('should have code DB_CONNECTION_FAILED (3001)', () => {
    const error = new DatabaseConnectionError();
    expect(error.code).toBe(ErrorCode.DB_CONNECTION_FAILED);
  });

  test('should extend DatabaseError', () => {
    const error = new DatabaseConnectionError();
    expect(error).toBeInstanceOf(DatabaseError);
  });
});
