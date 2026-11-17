import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { CreateInstanceCommand } from '@modules/instances/application/create/CreateInstanceCommand';
import { InstancesCreator } from '@modules/instances/application/create/InstancesCreator';

export class CreateInstanceCommandHandler implements ICommandHandler<CreateInstanceCommand> {
  constructor(private readonly useCase: InstancesCreator) {}

  subscribedTo(): typeof CreateInstanceCommand {
    return CreateInstanceCommand;
  }

  async handle(command: CreateInstanceCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
