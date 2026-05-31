import { DatabaseError } from '../../../../src/shared/infrastructure/errors/DatabaseError';
import { DatabaseUniqueConstraintError } from '../../../../src/shared/infrastructure/errors/DatabaseUniqueConstraintError';
import { ErrorCode } from '../../../../src/shared/infrastructure/errors/ErrorCode';

describe('DatabaseUniqueConstraintError', () => {
  test('should build message from entity and field', () => {
    const error = new DatabaseUniqueConstraintError('User', 'email');
    expect(error.message).toBe('User with the same email already exists');
  });

  test('should have code DB_CONSTRAINT_VIOLATION (3002)', () => {
    const error = new DatabaseUniqueConstraintError('User', 'email');
    expect(error.code).toBe(ErrorCode.DB_CONSTRAINT_VIOLATION);
  });

  test('should extend DatabaseError', () => {
    const error = new DatabaseUniqueConstraintError('User', 'email');
    expect(error).toBeInstanceOf(DatabaseError);
  });
});
