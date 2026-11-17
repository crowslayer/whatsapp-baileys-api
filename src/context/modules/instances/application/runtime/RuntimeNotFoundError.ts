import { DomainError } from '@shared/domain/error/DomainError';
import { ErrorCode } from '@shared/domain/error/ErrorCode';

export class RuntimeNotFoundError extends DomainError {
  readonly code = ErrorCode.RESOURCE_NOT_FOUND;
}
