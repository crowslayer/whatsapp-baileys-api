import { InstanceId } from '@domain/value-objects/InstanceId';

import { GroupLeaver } from '@application/groups/leave/GroupLeaver';
import { LeaveGroupCommand } from '@application/groups/leave/LeaveGroupCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class LeaveGroupCommandHandler implements ICommandHandler<LeaveGroupCommand> {
  constructor(private readonly leaver: GroupLeaver) {}

  subscribedTo(): typeof LeaveGroupCommand {
    return LeaveGroupCommand;
  }

  async handle(command: LeaveGroupCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);
    return await this.leaver.execute(instanceId, command.groupId);
  }
}
