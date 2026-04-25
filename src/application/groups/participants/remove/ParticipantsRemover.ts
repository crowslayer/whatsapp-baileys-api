import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { RemoveParticipantsGroupCommand } from '@application/groups/participants/remove/RemoveParticipantsGroupCommand';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class ParticipantsRemover {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(command: RemoveParticipantsGroupCommand): Promise<void> {
    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }
    const adapter = this.runtimeManager.get(command.instanceId);
    if (!adapter) {
      throw new NotFoundError('Instance not found');
    }

    await adapter.groups.removeParticipantsFromGroup(command.groupId, command.participants);
  }
}
