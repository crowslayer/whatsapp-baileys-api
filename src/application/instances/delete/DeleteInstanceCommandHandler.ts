import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { DeleteInstanceCommand } from './DeleteInstanceCommand';
import { InstancesEraser } from './InstancesEraser';

export class DeleteInstanceCommandHandler implements ICommandHandler<DeleteInstanceCommand> {
  constructor(private readonly eraser: InstancesEraser) {}

  subscribedTo(): typeof DeleteInstanceCommand {
    return DeleteInstanceCommand;
  }

  async handle(command: DeleteInstanceCommand): Promise<void> {
    await this.eraser.execute(command);
  }
}
