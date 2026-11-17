import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class RuntimeError extends InfrastructureError {
  readonly code = ErrorCode.INTERNAL_ERROR;
  readonly type = ErrorType.INTERNAL;
}
