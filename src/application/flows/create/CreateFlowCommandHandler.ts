import { CreateFlowCommand } from '@application/flows/create/CreateFlowCommand';
import { FlowCreator } from '@application/flows/create/FlowCreator';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class CreateFlowCommandHandler implements ICommandHandler<CreateFlowCommand> {
  constructor(private readonly creator: FlowCreator) {}

  subscribedTo(): typeof CreateFlowCommand {
    return CreateFlowCommand;
  }

  async handle(command: CreateFlowCommand): Promise<void> {
    await this.creator.execute(command.instanceId, command.name);
  }
}
