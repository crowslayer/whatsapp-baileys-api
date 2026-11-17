import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class CommandHandlerNotFoundError extends InfrastructureError {
  readonly code: ErrorCode = ErrorCode.COMMAND_HANDLER_NOT_FOUND;

  constructor(commandName: string) {
    super(`The command '${commandName}' does not have any registered handler.`);
  }
}
