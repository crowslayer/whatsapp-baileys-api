import { DeleteInstanceCommand } from '@application/instances/delete/DeleteInstanceCommand';
import { InstancesEraser } from '@application/instances/delete/InstancesEraser';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class DeleteInstanceCommandHandler implements ICommandHandler<DeleteInstanceCommand> {
  constructor(private readonly eraser: InstancesEraser) {}

  subscribedTo(): typeof DeleteInstanceCommand {
    return DeleteInstanceCommand;
  }

  async handle(command: DeleteInstanceCommand): Promise<void> {
    await this.eraser.execute(command);
  }
}
