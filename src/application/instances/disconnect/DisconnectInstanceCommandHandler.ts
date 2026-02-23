import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { DisconnectInstanceCommand } from './DisconnectInstanceCommand';
import { InstancesDisconnect } from './InstancesDisconnect';

export class DisconnectInstanceCommandHandler implements ICommandHandler<DisconnectInstanceCommand> {
  constructor(private readonly disconnect: InstancesDisconnect) {}

  subscribedTo(): typeof DisconnectInstanceCommand {
    return DisconnectInstanceCommand;
  }

  async handle(command: DisconnectInstanceCommand): Promise<void> {
    await this.disconnect.execute(command);
  }
}
