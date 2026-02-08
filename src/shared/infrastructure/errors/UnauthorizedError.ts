import { ApplicationError } from '@shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export class UnauthorizedError extends ApplicationError {
  readonly type = ErrorType.AUTHENTICATION;
  readonly code = ErrorCode.UNAUTHORIZED;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
