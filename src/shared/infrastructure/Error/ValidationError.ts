import { DomainError } from "@shared/infrastructure/Error/DomainError";
import { ErrorCode } from "@shared/infrastructure/Error/ErrorCodes";
import { ErrorType } from "@shared/infrastructure/Error/ErrorType";

export type ValidationItem = {
  field: string;
  message: string;
};

export class ValidationError extends DomainError {
  readonly code = ErrorCode.VALIDATION_FAILED;
  readonly type = ErrorType.VALIDATION;
  readonly errors: ValidationItem[];

  constructor(errors: ValidationItem[]) {
    super('Validation failed');
    this.errors = errors;
  }
}
