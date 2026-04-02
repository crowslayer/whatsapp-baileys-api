import { InstanceId } from '@domain/value-objects/InstanceId';

import { GroupSubjectCommand } from '@application/groups/update/subject/GroupSubjectCommand';
import { SubjetUpdater } from '@application/groups/update/subject/SubjectUpdater';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class GroupSubjectCommandHandler implements ICommandHandler<GroupSubjectCommand> {
  constructor(private readonly updater: SubjetUpdater) {}

  subscribedTo(): typeof GroupSubjectCommand {
    return GroupSubjectCommand;
  }

  async handle(command: GroupSubjectCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);

    return await this.updater.execute(instanceId, command.groupId, command.subject);
  }
}
