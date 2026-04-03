import { InstanceId } from '@domain/value-objects/InstanceId';

import { GroupSettingCommand } from '@application/groups/update/settings/GroupSettingCommand';
import { SettingUpdater } from '@application/groups/update/settings/SettingUpdater';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class GroupSettingCommandHandler implements ICommandHandler<GroupSettingCommand> {
  constructor(private readonly updater: SettingUpdater) {}

  subscribedTo(): typeof GroupSettingCommand {
    return GroupSettingCommand;
  }

  async handle(command: GroupSettingCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);
    const { announcement, locked } = command;
    if (announcement === undefined && locked === undefined) {
      return;
    }

    if (announcement !== undefined) {
      await this.updater.execute(
        instanceId,
        command.groupId,
        announcement ? 'announcement' : 'not_announcement'
      );
    }
    if (locked !== undefined) {
      await this.updater.execute(instanceId, command.groupId, locked ? 'locked' : 'unlocked');
    }
  }
}
