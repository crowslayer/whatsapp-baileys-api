import { ApplicationError } from '@shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCode';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export class ServiceOverloadedError extends ApplicationError {
  readonly code: ErrorCode = ErrorCode.SERVICE_OVERLOADED;
  readonly type: ErrorType = ErrorType.INFRASTRUCTURE;
  readonly retryAfter: number;

  constructor(retryAfter: number, originalError?: unknown) {
    super('Service temporarily overloaded', originalError);

    this.retryAfter = retryAfter;

    Object.setPrototypeOf(this, ServiceOverloadedError.prototype);
  }
}
