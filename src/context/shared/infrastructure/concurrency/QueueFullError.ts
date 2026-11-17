import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class QueueFullError extends InfrastructureError {
  readonly code = ErrorCode.LIMIT_EXCEEDED;
}
