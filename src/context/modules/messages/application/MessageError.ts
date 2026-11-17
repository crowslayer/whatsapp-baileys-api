import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class MessageError extends InfrastructureError {
  readonly code = ErrorCode.THIRD_PARTY_API_ERROR;
}
