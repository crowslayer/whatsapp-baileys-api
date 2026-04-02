import { InstanceId } from '@domain/value-objects/InstanceId';

import { DemoteParticipantsCommand } from '@application/groups/participants/demote/DemoteParticipantsCommand';
import { ParticipantsDemoter } from '@application/groups/participants/demote/ParticipantsDemoter';

import { ICommandHandler } from '@shared/domain/commands/CommandHandler';

export class DemoteParticipantsCommandHandler implements ICommandHandler<DemoteParticipantsCommand> {
  constructor(private readonly demoter: ParticipantsDemoter) {}

  subscribedTo(): typeof DemoteParticipantsCommand {
    return DemoteParticipantsCommand;
  }

  async handle(command: DemoteParticipantsCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);
    return await this.demoter.execute(instanceId, command.groupId, command.participants);
  }
}
