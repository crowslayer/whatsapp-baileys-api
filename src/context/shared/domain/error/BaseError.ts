import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

export abstract class BaseError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly type: ErrorType;

  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);

    this.name = new.target.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
