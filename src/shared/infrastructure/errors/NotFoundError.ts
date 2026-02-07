import { DomainError } from '@shared/infrastructure/Error/DomainError';
import { ErrorCode } from '@shared/infrastructure/Error/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/Error/ErrorType';

export class NotFoundError extends DomainError {
  readonly type = ErrorType.DOMAIN;
  readonly code = ErrorCode.INVALID_ARGUMENT;

  constructor(message: string) {
    super(message);
  }
}
