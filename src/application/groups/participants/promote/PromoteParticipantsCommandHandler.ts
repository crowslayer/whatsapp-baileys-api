import { InstanceId } from '@domain/value-objects/InstanceId';

import { ParticipantPromoter } from '@application/groups/participants/promote/ParticipantPromoter';
import { PromoteParticipantsCommand } from '@application/groups/participants/promote/PromoteParticipantsCommand';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class PromoteParticipantsCommandHandler implements ICommandHandler<PromoteParticipantsCommand> {
  constructor(private readonly promoter: ParticipantPromoter) {}

  subscribedTo(): typeof PromoteParticipantsCommand {
    return PromoteParticipantsCommand;
  }

  async handle(command: PromoteParticipantsCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);
    return await this.promoter.execute(instanceId, command.groupId, command.participants);
  }
}
