import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { DescriptionUpdater } from '@modules/groups/application/update/description/DescriptionUpdater';
import { GroupDescriptionCommand } from '@modules/groups/application/update/description/GroupDescriptionCommand';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class GroupDescriptionCommandHandler implements ICommandHandler<GroupDescriptionCommand> {
  constructor(private readonly useCase: DescriptionUpdater) {}

  subscribedTo(): typeof GroupDescriptionCommand {
    return GroupDescriptionCommand;
  }

  async handle(command: GroupDescriptionCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);

    return await this.useCase.execute(instanceId, command.groupId, command.description);
  }
}
