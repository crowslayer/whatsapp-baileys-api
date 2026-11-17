import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { GroupSettingCommand } from '@modules/groups/application/update/settings/GroupSettingCommand';
import { SettingUpdater } from '@modules/groups/application/update/settings/SettingUpdater';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class GroupSettingCommandHandler implements ICommandHandler<GroupSettingCommand> {
  constructor(private readonly useCase: SettingUpdater) {}

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
      await this.useCase.execute(
        instanceId,
        command.groupId,
        announcement ? 'announcement' : 'not_announcement'
      );
    }
    if (locked !== undefined) {
      await this.useCase.execute(instanceId, command.groupId, locked ? 'locked' : 'unlocked');
    }
  }
}
