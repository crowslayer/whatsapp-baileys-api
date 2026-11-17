import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class ConfigurationError extends InfrastructureError {
  readonly code = ErrorCode.MISSING_REQUIRED_FIELDS;
}
