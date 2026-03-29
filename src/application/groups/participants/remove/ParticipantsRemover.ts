import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { RemoveParticipantsGroupCommand } from '@application/groups/participants/remove/RemoveParticipantsGroupCommand';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class ParticipantsRemover {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IConnectionManager
  ) {}

  async execute(command: RemoveParticipantsGroupCommand): Promise<void> {
    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }
    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new NotFoundError('Instance not found');
    }

    await adapter.removeParticipantsFromGroup(command.groupId, command.participants);
  }
}
