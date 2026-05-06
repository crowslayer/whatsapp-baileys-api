import { DeleteFlowCommand } from '@application/flows/delete/DeleteFlowCommand';
import { FlowEraser } from '@application/flows/delete/FlowEraser';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class DeleteFlowCommandHandler implements ICommandHandler<DeleteFlowCommand> {
  constructor(private readonly eraser: FlowEraser) {}

  subscribedTo(): typeof DeleteFlowCommand {
    return DeleteFlowCommand;
  }

  async handle(command: DeleteFlowCommand): Promise<void> {
    await this.eraser.execute(command.flowId);
  }
}
