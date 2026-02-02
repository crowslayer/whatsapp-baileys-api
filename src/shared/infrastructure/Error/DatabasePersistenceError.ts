import { DatabaseError } from "@shared/infrastructure/Error/DatabaseError";
import { ErrorCode } from "@shared/infrastructure/Error/ErrorCodes";
import { ErrorType } from "@shared/infrastructure/Error/ErrorType";

export class DatabasePersistenceError extends DatabaseError {
  readonly type = ErrorType.DATABASE;
  readonly code = ErrorCode.DB_PERSISTENCE_ERROR;

  constructor(originalError?: unknown) {
    super('Unexpected database error', originalError);

  }


}
