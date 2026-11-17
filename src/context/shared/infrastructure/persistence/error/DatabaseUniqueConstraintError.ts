import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { DatabaseError } from '@shared/infrastructure/persistence/error/DatabaseError';

export class DatabaseUniqueConstraintError extends DatabaseError {
  readonly code = ErrorCode.DB_DUPLICATE_KEY;

  constructor(entity: string, field: string, originalError?: unknown) {
    super(`${entity} with the same ${field} already exists`, { cause: originalError });
  }
}
