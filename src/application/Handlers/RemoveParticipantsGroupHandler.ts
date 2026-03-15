import { RemoveParticipantsGroupCommand } from '@application/commands/RemoveParticipantsGroupCommand';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

export class RemoveParticipantsGroupHandler {
  constructor(private readonly connectionManager: BaileysConnectionManager) {}

  async execute(command: RemoveParticipantsGroupCommand): Promise<void> {
    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new Error('Instance not found');
    }

    await adapter.removeParticipantsFromGroup(command.groupId, command.participants);
  }
}
