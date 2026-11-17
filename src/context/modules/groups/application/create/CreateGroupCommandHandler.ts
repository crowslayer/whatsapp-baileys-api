import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { CreateGroupCommand } from '@modules/groups/application/create/CreateGroupCommand';
import { GroupCreator } from '@modules/groups/application/create/GroupCreator';

export class CreateGroupCommandHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(private readonly useCase: GroupCreator) {}

  subscribedTo(): typeof CreateGroupCommand {
    return CreateGroupCommand;
  }

  async handle(command: CreateGroupCommand): Promise<string> {
    return await this.useCase.execute(command);
  }
}
