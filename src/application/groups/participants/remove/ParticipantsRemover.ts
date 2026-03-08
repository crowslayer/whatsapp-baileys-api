import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { RemoveParticipantsGroupCommand } from './RemoveParticipantsGroupCommand';

export class ParticipantsRemover {
  constructor(private readonly connectionManager: IConnectionManager) {}

  async execute(command: RemoveParticipantsGroupCommand): Promise<void> {
    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new NotFoundError('Instance not found');
    }

    await adapter.removeParticipantsFromGroup(command.groupId, command.participants);
  }
}
