import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export abstract class ApplicationError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly type: ErrorType;
  readonly cause?: unknown;

  protected constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = new.target.name;
    this.cause = originalError;

    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
