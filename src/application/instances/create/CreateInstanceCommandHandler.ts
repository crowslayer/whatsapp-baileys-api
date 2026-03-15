import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { AggregateResponse } from './AggregateResponse';
import { CreateInstanceCommand } from './CreateInstanceCommand';
import { InstancesCreator } from './InstancesCreator';

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
