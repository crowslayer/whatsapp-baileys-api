import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class QueryNotRegisteredError extends InfrastructureError {
  readonly code: ErrorCode = ErrorCode.QUERY_HANDLER_NOT_FOUND;
}
