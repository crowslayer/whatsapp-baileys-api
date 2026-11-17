import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class EventDeserializationError extends InfrastructureError {
  readonly code = ErrorCode.EVENT_DESERIALIZATION_FAILED;
}
