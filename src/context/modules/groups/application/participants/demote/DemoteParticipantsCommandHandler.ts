import { ICommandHandler } from '@shared/domain/command/CommandHandler';

import { DemoteParticipantsCommand } from '@modules/groups/application/participants/demote/DemoteParticipantsCommand';
import { ParticipantsDemoter } from '@modules/groups/application/participants/demote/ParticipantsDemoter';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class DemoteParticipantsCommandHandler implements ICommandHandler<DemoteParticipantsCommand> {
  constructor(private readonly useCase: ParticipantsDemoter) {}

  subscribedTo(): typeof DemoteParticipantsCommand {
    return DemoteParticipantsCommand;
  }

  async handle(command: DemoteParticipantsCommand): Promise<void> {
    const instanceId = InstanceId.fromString(command.instanceId);
    await this.useCase.execute(instanceId, command.groupId, command.participants);
  }
}
