import { DatabaseError } from '../../../../src/shared/infrastructure/errors/DatabaseError';
import { DatabasePersistenceError } from '../../../../src/shared/infrastructure/errors/DatabasePersistenceError';
import { ErrorCode } from '../../../../src/shared/infrastructure/errors/ErrorCode';

describe('DatabasePersistenceError', () => {
  test('should have message "Unexpected database error"', () => {
    const error = new DatabasePersistenceError();
    expect(error.message).toBe('Unexpected database error');
  });

  test('should have code DB_PERSISTENCE_ERROR (3003)', () => {
    const error = new DatabasePersistenceError();
    expect(error.code).toBe(ErrorCode.DB_PERSISTENCE_ERROR);
  });

  test('should extend DatabaseError', () => {
    const error = new DatabasePersistenceError();
    expect(error).toBeInstanceOf(DatabaseError);
  });
});
