import { AddParticipantGroupCommand } from '@application/commands/AddParticipantGroupCommand';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

export class AddParticipantsGroupHandler {
  constructor(private readonly connectionManager: BaileysConnectionManager) {}

  async execute(command: AddParticipantGroupCommand): Promise<void> {
    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new Error('Instance not found');
    }

    await adapter.addParticipantsToGroup(command.groupId, command.participants);
  }
}
