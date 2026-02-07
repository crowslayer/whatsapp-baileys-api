import { ApplicationError } from '@shared/infrastructure/Error/ApplicationError';
import { ErrorCode } from '@shared/infrastructure/Error/ErrorCodes';
import { ErrorType } from '@shared/infrastructure/Error/ErrorType';

export class WhatsAppConnectionError extends ApplicationError {
  readonly code = ErrorCode.INTERNAL_ERROR;
  readonly type = ErrorType.INTERNAL;

  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
  }
}
