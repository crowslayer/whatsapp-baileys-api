import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { GetInvitedLinkCommand } from '@modules/groups/application/invite/link/get/GetInvitedLinkCommand';
import { LinkGroupGetter } from '@modules/groups/application/invite/link/get/LinkGroupGetter';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class GetInvitedLinkCommandHandler implements ICommandHandler<GetInvitedLinkCommand> {
  constructor(private readonly linkGetter: LinkGroupGetter) {}

  subscribedTo(): typeof GetInvitedLinkCommand {
    return GetInvitedLinkCommand;
  }

  async handle(command: GetInvitedLinkCommand): Promise<string | undefined> {
    const instanceId = InstanceId.fromString(command.instanceId);
    return await this.linkGetter.execute(instanceId, command.groupId);
  }
}
