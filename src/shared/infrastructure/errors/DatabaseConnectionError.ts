import { DatabaseError } from '@shared/infrastructure/errors/DatabaseError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCode';

export class DatabaseConnectionError extends DatabaseError {
  readonly code = ErrorCode.DB_CONNECTION_FAILED;

  constructor(originalError?: unknown) {
    super('Database connection error', originalError);
  }
}
