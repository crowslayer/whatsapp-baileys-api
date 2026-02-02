import { DomainError } from "@shared/infrastructure/Error/DomainError";
import { ErrorCode } from "@shared/infrastructure/Error/ErrorCodes";
import { ErrorType } from "@shared/infrastructure/Error/ErrorType";

export class ConflictError extends DomainError {
    readonly type = ErrorType.DOMAIN;
    readonly code = ErrorCode.CONFLICT;
    
    constructor(message: string, originalError?: unknown) {
      super(message, originalError);
      
    }
  }