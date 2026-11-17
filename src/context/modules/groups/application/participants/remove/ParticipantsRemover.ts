import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { RemoveParticipantsGroupCommand } from '@modules/groups/application/participants/remove/RemoveParticipantsGroupCommand';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';

export class ParticipantsRemover {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(command: RemoveParticipantsGroupCommand): Promise<void> {
    const instance = await this.repository.findById(InstanceId.fromString(command.instanceId));
    if (!instance) {
      throw new InstanceNotFoundError(`Instance ${command.instanceId} not found`);
    }
    const adapter = this.runtimeManager.get(command.instanceId);
    if (!adapter) {
      throw new InstanceNotFoundError('Instance not found in runtime');
    }

    await adapter.groups.removeParticipantsFromGroup(command.groupId, command.participants);
  }
}
