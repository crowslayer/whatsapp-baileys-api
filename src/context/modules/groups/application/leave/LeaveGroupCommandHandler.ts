import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { GroupLeaver } from '@modules/groups/application/leave/GroupLeaver';
import { LeaveGroupCommand } from '@modules/groups/application/leave/LeaveGroupCommand';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class LeaveGroupCommandHandler implements ICommandHandler<LeaveGroupCommand> {
  constructor(private readonly useCase: GroupLeaver) {}

  subscribedTo(): typeof LeaveGroupCommand {
    return LeaveGroupCommand;
  }

  async handle(command: LeaveGroupCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);
    return await this.useCase.execute(instanceId, command.groupId);
  }
}
