import { DomainError } from '@shared/infrastructure/errors/DomainError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

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
