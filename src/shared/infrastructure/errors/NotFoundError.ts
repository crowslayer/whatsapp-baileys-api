import { DomainError } from '@shared/infrastructure/errors/DomainError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export class NotFoundError extends DomainError {
  readonly type = ErrorType.DOMAIN;
  readonly code = ErrorCode.INVALID_ARGUMENT;

  constructor(message: string) {
    super(message);
  }
}
