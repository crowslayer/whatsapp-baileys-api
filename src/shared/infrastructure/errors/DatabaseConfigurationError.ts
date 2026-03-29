import { DatabaseError } from '@shared/infrastructure/errors/DatabaseError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCode';

export class DatabaseConfigurationError extends DatabaseError {
  readonly code = ErrorCode.DB_CONNECTION_FAILED;

  constructor(originalError?: unknown) {
    super('Database Configuration error', originalError);
  }
}
