import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { ParticipantPromoter } from '@modules/groups/application/participants/promote/ParticipantPromoter';
import { PromoteParticipantsCommand } from '@modules/groups/application/participants/promote/PromoteParticipantsCommand';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class PromoteParticipantsCommandHandler implements ICommandHandler<PromoteParticipantsCommand> {
  constructor(private readonly useCase: ParticipantPromoter) {}

  subscribedTo(): typeof PromoteParticipantsCommand {
    return PromoteParticipantsCommand;
  }

  async handle(command: PromoteParticipantsCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);
    return await this.useCase.execute(instanceId, command.groupId, command.participants);
  }
}
