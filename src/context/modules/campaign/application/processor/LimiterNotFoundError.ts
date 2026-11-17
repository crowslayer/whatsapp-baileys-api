import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class LimiterNotFoundError extends InfrastructureError {
  readonly code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND;
}
