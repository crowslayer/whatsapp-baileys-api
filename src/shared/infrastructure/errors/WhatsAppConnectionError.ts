import { ApplicationError } from '@shared/infrastructure/errors/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/errors/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/errors/ErrorType';

export class WhatsAppConnectionError extends ApplicationError {
  readonly code = ErrorCode.INTERNAL_ERROR;
  readonly type = ErrorType.INTERNAL;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
