import { DeleteNodesCommand } from '@application/flows/nodes/delete/DeleteNodesCommand';
import { NodesEraser } from '@application/flows/nodes/delete/NodesEraser';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class DeleteNodesCommandHandler implements ICommandHandler<DeleteNodesCommand> {
  constructor(private readonly eraser: NodesEraser) {}

  subscribedTo(): typeof DeleteNodesCommand {
    return DeleteNodesCommand;
  }

  async handle(command: DeleteNodesCommand): Promise<unknown> {
    return await this.eraser.execute(command.flowId);
  }
}
