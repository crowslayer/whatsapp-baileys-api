import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class ServiceOverloadedError extends InfrastructureError {
  readonly code: ErrorCode = ErrorCode.LIMIT_EXCEEDED;
  readonly type: ErrorType = ErrorType.INFRASTRUCTURE;
  readonly retryAfter: number;

  constructor(retryAfter: number, originalError?: unknown) {
    super('Service temporarily overloaded', { cause: originalError });

    this.retryAfter = retryAfter;

    Object.setPrototypeOf(this, ServiceOverloadedError.prototype);
  }
}
