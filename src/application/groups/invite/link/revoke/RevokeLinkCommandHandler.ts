import { InstanceId } from '@domain/value-objects/InstanceId';

import { LinkGroupRevoker } from '@application/groups/invite/link/revoke/LinkGroupRevoker';
import { RevokeLinkCommand } from '@application/groups/invite/link/revoke/RevokeLinkCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class RevokeLinkCommandHandler implements ICommandHandler<RevokeLinkCommand> {
  constructor(private readonly revoker: LinkGroupRevoker) {}

  subscribedTo(): typeof RevokeLinkCommand {
    return RevokeLinkCommand;
  }

  async handle(command: RevokeLinkCommand): Promise<string | undefined> {
    const instanceId = InstanceId.fromString(command.instanceId);

    return await this.revoker.execute(instanceId, command.groupId);
  }
}
