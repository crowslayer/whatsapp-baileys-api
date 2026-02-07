import { ApplicationError } from '@shared/infrastructure/Error/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/Error/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/Error/ErrorType';

export class UnauthorizedError extends ApplicationError {
  readonly type = ErrorType.AUTHENTICATION;
  readonly code = ErrorCode.UNAUTHORIZED;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
