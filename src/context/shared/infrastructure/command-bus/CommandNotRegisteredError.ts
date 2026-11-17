import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { InfrastructureError } from '@shared/domain/error/InfrastructureError';

export class CommandNotRegisteredError extends InfrastructureError {
  readonly code = ErrorCode.COMMAND_HANDLER_NOT_FOUND;

  constructor(commandName: string) {
    super(`The command <${commandName}> hasn't a command handler associated`);
  }
}
