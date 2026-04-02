import { InstanceId } from '@domain/value-objects/InstanceId';

import { GetInvitedLinkCommand } from '@application/groups/invite/link/get/GetInvitedLinkCommand';
import { LinkGroupGetter } from '@application/groups/invite/link/get/LinkGroupGetter';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class GetInvitedLinkCommandHandler implements ICommandHandler<GetInvitedLinkCommand> {
  constructor(private readonly linkGetter: LinkGroupGetter) {}

  subscribedTo(): typeof GetInvitedLinkCommand {
    return GetInvitedLinkCommand;
  }

  async handle(command: GetInvitedLinkCommand): Promise<string> {
    const instanceId = InstanceId.fromString(command.instanceId);
    return await this.linkGetter.execute(instanceId, command.groupId);
  }
}
