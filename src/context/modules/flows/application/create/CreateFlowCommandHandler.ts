import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { CreateFlowCommand } from '@modules/flows/application/create/CreateFlowCommand';
import { FlowCreator } from '@modules/flows/application/create/FlowCreator';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { Name } from '@modules/instances/domain/Name';

export class CreateFlowCommandHandler implements ICommandHandler<CreateFlowCommand> {
  constructor(private readonly creator: FlowCreator) {}

  subscribedTo(): typeof CreateFlowCommand {
    return CreateFlowCommand;
  }

  async handle(command: CreateFlowCommand): Promise<void> {
    await this.creator.execute(
      InstanceId.fromString(command.instanceId),
      Name.create(command.name)
    );
  }
}
