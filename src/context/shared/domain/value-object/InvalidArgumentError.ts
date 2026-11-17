import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';

export class InvalidArgumentError extends DomainError {
  readonly code = ErrorCode.VALIDATION_FAILED;

  constructor(message: string) {
    super(message);
  }
}
