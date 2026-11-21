import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { CreateNodesCommand } from '@modules/flows/application/nodes/create/CreateNodesCommand';
import { NodesCreator } from '@modules/flows/application/nodes/create/NodesCreator';

export class CreateNodesCommandHandler implements ICommandHandler<CreateNodesCommand> {
  constructor(private readonly useCase: NodesCreator) {}

  subscribedTo(): typeof CreateNodesCommand {
    return CreateNodesCommand;
  }

  async handle(command: CreateNodesCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
