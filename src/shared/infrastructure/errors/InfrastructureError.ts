import { ApplicationError } from '@shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export class InfrastructureError extends ApplicationError {
  readonly type = ErrorType.INTERNAL;
  readonly code = ErrorCode.INTERNAL_ERROR;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
