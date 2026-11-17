import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';

export interface IValidationErrorDetail {
  field: string;
  message: string;
}

export class ValueObjectValidationError extends DomainError {
  readonly code: ErrorCode = ErrorCode.VALIDATION_FAILED;
  public readonly errors: IValidationErrorDetail[];

  constructor(errors: IValidationErrorDetail[] | string, fieldName = 'value') {
    if (typeof errors === 'string') {
      super(errors);
      this.errors = [{ field: fieldName, message: errors }];
    } else {
      super(`Validation failed: ${errors.map((e) => e.message).join(', ')}`);
      this.errors = errors;
    }
  }
}
