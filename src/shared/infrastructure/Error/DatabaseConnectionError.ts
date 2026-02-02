import { DatabaseError } from "@shared/infrastructure/Error/DatabaseError";
import { ErrorCode } from "@shared/infrastructure/Error/ErrorCodes";

export class DatabaseConnectionError extends DatabaseError {
    readonly code = ErrorCode.DB_CONNECTION_FAILED;

    constructor(originalError?: unknown) {
      super(
        'Database connection error',
        originalError
      );
    }
  }
  