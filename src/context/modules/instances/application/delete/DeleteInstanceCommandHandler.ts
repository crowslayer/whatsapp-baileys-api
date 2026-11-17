import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { DeleteInstanceCommand } from '@modules/instances/application/delete/DeleteInstanceCommand';
import { InstancesEraser } from '@modules/instances/application/delete/InstancesEraser';

export class DeleteInstanceCommandHandler implements ICommandHandler<DeleteInstanceCommand> {
  constructor(private readonly useCase: InstancesEraser) {}

  subscribedTo(): typeof DeleteInstanceCommand {
    return DeleteInstanceCommand;
  }

  async handle(command: DeleteInstanceCommand): Promise<void> {
    await this.useCase.execute(command);
  }
}
