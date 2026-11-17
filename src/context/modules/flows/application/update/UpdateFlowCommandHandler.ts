import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { FlowUpdater } from '@modules/flows/application/update/FlowUpdater';
import { UpdateFlowCommand } from '@modules/flows/application/update/UpdateFlowCommand';

export class UpdateFlowCommandHandler implements ICommandHandler<UpdateFlowCommand> {
  constructor(private readonly useCase: FlowUpdater) {}

  subscribedTo(): typeof UpdateFlowCommand {
    return UpdateFlowCommand;
  }

  async handle(command: UpdateFlowCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
