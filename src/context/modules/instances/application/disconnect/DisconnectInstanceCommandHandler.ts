import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { DisconnectInstanceCommand } from '@modules/instances/application/disconnect/DisconnectInstanceCommand';
import { InstancesDisconnect } from '@modules/instances/application/disconnect/InstancesDisconnect';

export class DisconnectInstanceCommandHandler implements ICommandHandler<DisconnectInstanceCommand> {
  constructor(private readonly disconnect: InstancesDisconnect) {}

  subscribedTo(): typeof DisconnectInstanceCommand {
    return DisconnectInstanceCommand;
  }

  async handle(command: DisconnectInstanceCommand): Promise<void> {
    await this.disconnect.execute(command);
  }
}
