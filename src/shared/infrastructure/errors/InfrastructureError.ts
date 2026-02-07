import { ApplicationError } from '@shared/infrastructure/Error/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/Error/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/Error/ErrorType';

export class InfrastructureError extends ApplicationError {
  readonly type = ErrorType.INTERNAL;
  readonly code = ErrorCode.INTERNAL_ERROR;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
