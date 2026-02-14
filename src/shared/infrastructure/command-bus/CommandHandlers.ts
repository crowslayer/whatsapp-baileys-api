import { Command } from '@shared/domain/commands/Command';
import { ICommandHandler } from '@shared/domain/commands/CommandHandler';
import { CommandNotRegisteredError } from '@shared/domain/commands/CommandNotRegisteredError';

import { InfrastructureError } from '../errors/InfrastructureError';

export class CommandHandlers extends Map<Command, ICommandHandler<Command>> {
  constructor(commandHandlers: Array<ICommandHandler<Command>>) {
    super();
    commandHandlers.forEach((commandHandler) => {
      this.set(commandHandler.suscribedTo(), commandHandler);
    });
  }

  get(command: Command): ICommandHandler<Command> {
    try {
      const commandHandler = super.get(command.constructor);

      if (!commandHandler) {
        throw new CommandNotRegisteredError(command);
      }
      return commandHandler;
    } catch (error: unknown) {
      const errorParse = error as Error;
      throw new InfrastructureError(errorParse.message, error);
    }
  }
}
