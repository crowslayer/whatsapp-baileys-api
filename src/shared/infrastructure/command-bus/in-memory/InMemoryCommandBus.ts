import { Command } from '@shared/domain/commands/Command';
import { ICommandBus } from '@shared/domain/commands/CommandBus';

import { CommandHandlers } from '../CommandHandlers';

export class InMemoryCommandBus implements ICommandBus {
  constructor(private commandHandlers: CommandHandlers) {}

  async dispatch(command: Command): Promise<void> {
    const handler = this.commandHandlers.get(command);

    await handler.handle(command);
  }
}
