import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { DatabaseError } from '@shared/infrastructure/persistence/error/DatabaseError';

export class DatabaseConfigurationError extends DatabaseError {
  readonly code = ErrorCode.DB_CONNECTION_FAILED;
}
