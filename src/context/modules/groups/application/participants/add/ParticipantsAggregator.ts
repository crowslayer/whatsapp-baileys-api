import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { AddParticipantGroupCommand } from '@modules/groups/application/participants/add/AddParticipantGroupCommand';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';

export class ParticipantsAggregator {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(command: AddParticipantGroupCommand): Promise<void> {
    const instance = await this.repository.findById(InstanceId.fromString(command.instanceId));
    if (!instance) {
      throw new InstanceNotFoundError(`Instance ${command.instanceId} not found`);
    }
    const adapter = this.runtimeManager.get(command.instanceId);
    if (!adapter) {
      throw new InstanceNotFoundError(`Instance ${command.instanceId} not found`);
    }

    await adapter.groups.addParticipantsToGroup(command.groupId, command.participants);
  }
}
