import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { DeleteFlowCommand } from '@modules/flows/application/delete/DeleteFlowCommand';
import { FlowEraser } from '@modules/flows/application/delete/FlowEraser';

export class DeleteFlowCommandHandler implements ICommandHandler<DeleteFlowCommand> {
  constructor(private readonly useCase: FlowEraser) {}

  subscribedTo(): typeof DeleteFlowCommand {
    return DeleteFlowCommand;
  }

  async handle(command: DeleteFlowCommand): Promise<void> {
    await this.useCase.execute(command.flowId);
  }
}
