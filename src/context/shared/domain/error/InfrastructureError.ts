import { BaseError } from '@shared/domain/error/BaseError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ErrorType } from '@shared/domain/error/ErrorType';

export abstract class InfrastructureError extends BaseError {
  abstract readonly code: ErrorCode;
  readonly type: ErrorType = ErrorType.INFRASTRUCTURE;
}
