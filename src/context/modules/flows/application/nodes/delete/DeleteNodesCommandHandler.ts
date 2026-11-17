import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { DeleteNodesCommand } from '@modules/flows/application/nodes/delete/DeleteNodesCommand';
import { NodesEraser } from '@modules/flows/application/nodes/delete/NodesEraser';

export class DeleteNodesCommandHandler implements ICommandHandler<DeleteNodesCommand> {
  constructor(private readonly useCase: NodesEraser) {}

  subscribedTo(): typeof DeleteNodesCommand {
    return DeleteNodesCommand;
  }

  async handle(command: DeleteNodesCommand): Promise<unknown> {
    return await this.useCase.execute(command.flowId);
  }
}
