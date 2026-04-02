import { InstanceId } from '@domain/value-objects/InstanceId';

import { AcceptedInviteGroupCommand } from '@application/groups/invite/accept/AcceptedInviteGroupCommand';
import { GroupInviteAccepted } from '@application/groups/invite/accept/GroupInviteAccepted';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class AcceptedInviteGroupCommandHandler implements ICommandHandler<AcceptedInviteGroupCommand> {
  constructor(private readonly aceptedInviter: GroupInviteAccepted) {}

  subscribedTo(): typeof AcceptedInviteGroupCommand {
    return AcceptedInviteGroupCommand;
  }

  async handle(command: AcceptedInviteGroupCommand): Promise<string | undefined> {
    const intanceId = InstanceId.fromString(command.instanceId);
    return await this.aceptedInviter.execute(intanceId, command.code);
  }
}
