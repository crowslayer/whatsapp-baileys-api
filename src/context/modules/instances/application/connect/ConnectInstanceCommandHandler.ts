import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { ConnectInstanceCommand } from '@modules/instances/application/connect/ConnectInstanceCommand';
import { InstancesConnect } from '@modules/instances/application/connect/InstancesConnect';

export class ConnectInstanceCommandHandler implements ICommandHandler<ConnectInstanceCommand> {
  constructor(private readonly useCase: InstancesConnect) {}

  subscribedTo(): typeof ConnectInstanceCommand {
    return ConnectInstanceCommand;
  }

  async handle(command: ConnectInstanceCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
