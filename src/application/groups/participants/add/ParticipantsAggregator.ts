import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { AddParticipantGroupCommand } from './AddParticipantGroupCommand';

export class ParticipantsAggregator {
  constructor(private readonly connectionManager: IConnectionManager) {}

  async execute(command: AddParticipantGroupCommand): Promise<void> {
    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new NotFoundError('Instance not found');
    }

    await adapter.addParticipantsToGroup(command.groupId, command.participants);
  }
}
