import { ConnectInstanceCommand } from '@application/instances/connect/ConnectInstanceCommand';
import { InstancesConnect } from '@application/instances/connect/InstancesConnect';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class ConnectInstanceCommandHandler implements ICommandHandler<ConnectInstanceCommand> {
  constructor(private readonly conector: InstancesConnect) {}

  subscribedTo(): typeof ConnectInstanceCommand {
    return ConnectInstanceCommand;
  }

  async handle(command: ConnectInstanceCommand): Promise<void> {
    await this.conector.execute(command);
  }
}
