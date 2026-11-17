import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { CreateInstanceCommand } from '@modules/instances/application/create/CreateInstanceCommand';
import { InstancesCreator } from '@modules/instances/application/create/InstancesCreator';
import { InstanceResponse } from '@modules/instances/application/InstanceResponse';

export class CreateInstanceCommandHandler implements ICommandHandler<CreateInstanceCommand> {
  constructor(private readonly useCase: InstancesCreator) {}

  subscribedTo(): typeof CreateInstanceCommand {
    return CreateInstanceCommand;
  }

  async handle(command: CreateInstanceCommand): Promise<InstanceResponse> {
    const instance = await this.useCase.execute(command);
    return InstanceResponse.create(instance.toPrimitives());
  }
}
