import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { AcceptedInviteGroupCommand } from '@modules/groups/application/invite/accept/AcceptedInviteGroupCommand';
import { GroupInviteAccepted } from '@modules/groups/application/invite/accept/GroupInviteAccepted';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class AcceptedInviteGroupCommandHandler implements ICommandHandler<AcceptedInviteGroupCommand> {
  constructor(private readonly useCase: GroupInviteAccepted) {}

  subscribedTo(): typeof AcceptedInviteGroupCommand {
    return AcceptedInviteGroupCommand;
  }

  async handle(command: AcceptedInviteGroupCommand): Promise<string | undefined> {
    const intanceId = InstanceId.fromString(command.instanceId);
    return await this.useCase.execute(intanceId, command.code);
  }
}
