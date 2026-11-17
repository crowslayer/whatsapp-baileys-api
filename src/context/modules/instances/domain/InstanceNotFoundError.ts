import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';

export class InstanceNotFoundError extends DomainError {
  readonly code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND;
}
