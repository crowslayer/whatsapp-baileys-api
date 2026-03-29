import { DisconnectInstanceCommand } from '@application/instances/disconnect/DisconnectInstanceCommand';
import { InstancesDisconnect } from '@application/instances/disconnect/InstancesDisconnect';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class DisconnectInstanceCommandHandler implements ICommandHandler<DisconnectInstanceCommand> {
  constructor(private readonly disconnect: InstancesDisconnect) {}

  subscribedTo(): typeof DisconnectInstanceCommand {
    return DisconnectInstanceCommand;
  }

  async handle(command: DisconnectInstanceCommand): Promise<void> {
    await this.disconnect.execute(command);
  }
}
