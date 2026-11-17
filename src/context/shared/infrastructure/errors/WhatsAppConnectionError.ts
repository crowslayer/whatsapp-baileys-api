import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class WhatsAppConnectionError extends InfrastructureError {
  readonly code = ErrorCode.SERVICE_UNAVAILABLE;
  readonly type = ErrorType.INFRASTRUCTURE;
}
