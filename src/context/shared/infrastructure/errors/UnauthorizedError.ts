import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class UnauthorizedError extends InfrastructureError {
  readonly type = ErrorType.UNAUTHORIZED;
  readonly code = ErrorCode.UNAUTHORIZED;
}
