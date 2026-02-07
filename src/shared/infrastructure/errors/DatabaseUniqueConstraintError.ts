import { DatabaseError } from '@shared/infrastructure/Error/DatabaseError';
import { ErrorCode } from '@shared/infrastructure/Error/ErrorCodes';

export class DatabaseUniqueConstraintError extends DatabaseError {
  readonly code = ErrorCode.DB_CONSTRAINT_VIOLATION;

  constructor(entity: string, field: string, originalError?: unknown) {
    super(`${entity} with the same ${field} already exists`, originalError);
  }
}
