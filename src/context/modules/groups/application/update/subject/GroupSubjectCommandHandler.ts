import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { GroupSubjectCommand } from '@modules/groups/application/update/subject/GroupSubjectCommand';
import { SubjetUpdater } from '@modules/groups/application/update/subject/SubjectUpdater';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class GroupSubjectCommandHandler implements ICommandHandler<GroupSubjectCommand> {
  constructor(private readonly useCase: SubjetUpdater) {}

  subscribedTo(): typeof GroupSubjectCommand {
    return GroupSubjectCommand;
  }

  async handle(command: GroupSubjectCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);

    await this.useCase.execute(instanceId, command.groupId, command.subject);
  }
}
