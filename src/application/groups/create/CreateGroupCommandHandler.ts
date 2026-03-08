import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

import { CreateGroupCommand } from './CreateGroupCommand';
import { GroupCreator } from './GroupCreator';

export class CreateGroupCommandHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(private readonly creator: GroupCreator) {}

  subscribedTo(): typeof CreateGroupCommand {
    return CreateGroupCommand;
  }

  async handle(command: CreateGroupCommand): Promise<string> {
    return await this.creator.execute(command);
  }
}
