import { InstanceId } from '@domain/value-objects/InstanceId';

import { DescriptionUpdater } from '@application/groups/update/description/DescriptionUpdater';
import { GroupDescriptionCommand } from '@application/groups/update/description/GroupDescriptionCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class GroupDescriptionCommandHandler implements ICommandHandler<GroupDescriptionCommand> {
  constructor(private readonly updater: DescriptionUpdater) {}

  subscribedTo(): typeof GroupDescriptionCommand {
    return GroupDescriptionCommand;
  }

  async handle(command: GroupDescriptionCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);

    return await this.updater.execute(instanceId, command.groupId, command.description);
  }
}
