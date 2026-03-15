import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { ConnectInstanceCommand } from './ConnectInstanceCommand';
import { InstancesConnect } from './InstancesConnect';

export class ConnectInstanceCommandHandler implements ICommandHandler<ConnectInstanceCommand> {
  constructor(private readonly conector: InstancesConnect) {}

  subscribedTo(): typeof ConnectInstanceCommand {
    return ConnectInstanceCommand;
  }

  async handle(command: ConnectInstanceCommand): Promise<void> {
    await this.conector.execute(command);
  }
}
