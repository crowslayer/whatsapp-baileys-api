import { CreateNodesCommand } from '@application/flows/nodes/create/CreateNodesCommand';
import { NodesCreator } from '@application/flows/nodes/create/NodesCreator';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class CreateNodesCommandHandler implements ICommandHandler<CreateNodesCommand> {
  constructor(private readonly creator: NodesCreator) {}

  subscribedTo(): typeof CreateNodesCommand {
    return CreateNodesCommand;
  }

  async handle(command: CreateNodesCommand): Promise<void> {
    return await this.creator.execute(
      command.flowId,
      command.nodes,
      command.start,
      command.triggers
    );
  }
}
