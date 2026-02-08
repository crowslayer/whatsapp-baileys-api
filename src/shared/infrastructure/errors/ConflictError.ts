import { DomainError } from '@shared/infrastructure/errors/DomainError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export class ConflictError extends DomainError {
  readonly type = ErrorType.DOMAIN;
  readonly code = ErrorCode.CONFLICT;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
