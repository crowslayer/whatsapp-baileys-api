import { CreateGroupCommand } from '@application/groups/create/CreateGroupCommand';
import { GroupCreator } from '@application/groups/create/GroupCreator';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class CreateGroupCommandHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(private readonly creator: GroupCreator) {}

  subscribedTo(): typeof CreateGroupCommand {
    return CreateGroupCommand;
  }

  async handle(command: CreateGroupCommand): Promise<string> {
    return await this.creator.execute(command);
  }
}
