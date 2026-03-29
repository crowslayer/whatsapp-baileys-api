import { AggregateResponse } from '@application/instances/create/AggregateResponse';
import { CreateInstanceCommand } from '@application/instances/create/CreateInstanceCommand';
import { InstancesCreator } from '@application/instances/create/InstancesCreator';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class CreateInstanceCommandHandler implements ICommandHandler<CreateInstanceCommand> {
  constructor(private readonly creator: InstancesCreator) {}

  subscribedTo(): typeof CreateInstanceCommand {
    return CreateInstanceCommand;
  }

  async handle(command: CreateInstanceCommand): Promise<AggregateResponse> {
    const result = await this.creator.execute(command);
    return AggregateResponse.create(result.toJSON());
  }
}
