import { DatabaseError } from '@shared/infrastructure/errors/DatabaseError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export class DatabasePersistenceError extends DatabaseError {
  readonly type = ErrorType.DATABASE;
  readonly code = ErrorCode.DB_PERSISTENCE_ERROR;

  constructor(originalError?: unknown) {
    super('Unexpected database error', originalError);
  }
}
