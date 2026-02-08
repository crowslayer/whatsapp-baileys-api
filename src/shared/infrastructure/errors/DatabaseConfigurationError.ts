import { DatabaseError } from '@shared/infrastructure/errors/DatabaseError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';

export class DatabaseConfigurationError extends DatabaseError {
  code = ErrorCode.DB_CONNECTION_FAILED;

  constructor(originalError?: unknown) {
    super('Database Configuration error', originalError);
  }
}
