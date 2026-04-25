import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { AddParticipantGroupCommand } from '@application/groups/participants/add/AddParticipantGroupCommand';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class ParticipantsAggregator {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(command: AddParticipantGroupCommand): Promise<void> {
    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }
    const adapter = this.runtimeManager.get(command.instanceId);
    if (!adapter) {
      throw new NotFoundError('Instance not found');
    }

    await adapter.groups.addParticipantsToGroup(command.groupId, command.participants);
  }
}
