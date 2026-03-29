import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { AddParticipantGroupCommand } from '@application/groups/participants/add/AddParticipantGroupCommand';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class ParticipantsAggregator {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IConnectionManager
  ) {}

  async execute(command: AddParticipantGroupCommand): Promise<void> {
    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }
    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new NotFoundError('Instance not found');
    }

    await adapter.addParticipantsToGroup(command.groupId, command.participants);
  }
}
