import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { LinkGroupRevoker } from '@modules/groups/application/invite/link/revoke/LinkGroupRevoker';
import { RevokeLinkCommand } from '@modules/groups/application/invite/link/revoke/RevokeLinkCommand';
import { InstanceId } from '@modules/instances/domain/InstanceId';

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
