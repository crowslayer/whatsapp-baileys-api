
import { DatabaseError } from "@shared/infrastructure/Error/DatabaseError";
import { ErrorCode } from "@shared/infrastructure/Error/ErrorCodes";

export class DatabaseConfigurationError extends DatabaseError{
    code = ErrorCode.DB_CONNECTION_FAILED;
    
    constructor(originalError?: unknown) {
        super(
          'Database Configuration error',
          originalError
        );
      }
}