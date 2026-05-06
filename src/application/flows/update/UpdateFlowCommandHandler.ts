import { FlowUpdater } from '@application/flows/update/FlowUpdater';
import { UpdateFlowCommand } from '@application/flows/update/UpdateFlowCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class UpdateFlowCommandHandler implements ICommandHandler<UpdateFlowCommand> {
  constructor(private readonly updater: FlowUpdater) {}

  subscribedTo(): typeof UpdateFlowCommand {
    return UpdateFlowCommand;
  }

  async handle(command: UpdateFlowCommand): Promise<void> {
    await this.updater.execute(command.flowId, command.instanceId, command.name);
  }
}
