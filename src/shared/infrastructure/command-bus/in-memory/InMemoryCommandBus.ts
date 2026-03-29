import { Command } from '@shared/domain/commands/Command';
import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { CommandHandlers } from '@shared/infrastructure/command-bus/CommandHandlers';

export class InMemoryCommandBus implements ICommandBus {
  constructor(private commandHandlers: CommandHandlers) {}

  dispatch<TResponse>(command: Command<TResponse>): Promise<TResponse> {
    const handler = this.commandHandlers.get(command);

    return handler.handle(command);
  }
}
