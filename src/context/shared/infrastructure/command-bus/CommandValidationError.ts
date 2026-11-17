import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class CommandValidationError extends InfrastructureError {
  readonly code: ErrorCode = ErrorCode.COMMAND_VALIDATION_FAILED;

  constructor(
    commandName: string,
    public readonly errors: string[]
  ) {
    super(`Validation failed for command '${commandName}'. Details: ${errors.join(', ')}`);
  }
}
