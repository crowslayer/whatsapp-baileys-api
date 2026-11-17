import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

import { ErrorCode } from 'context/shared/domain/error/ErrorCode';
import { ErrorType } from 'context/shared/domain/error/ErrorType';

export class RuntimeError extends InfrastructureError {
  readonly code = ErrorCode.INTERNAL_ERROR;
  readonly type = ErrorType.INTERNAL;
}
