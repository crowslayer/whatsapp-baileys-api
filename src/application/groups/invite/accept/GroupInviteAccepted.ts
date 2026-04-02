import { InstanceId } from '@domain/value-objects/InstanceId';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class GroupInviteAccepted {
  constructor(private readonly connectionManager: IConnectionManager) {}

  async execute(instanceId: InstanceId, code: string): Promise<string | undefined> {
    const adapter = this.connectionManager.getConnection(instanceId.value);
    if (!adapter) {
      throw new WhatsAppConnectionError('WhatsApp Instance not connected or not found');
    }
    return await adapter.acceptGroupInvite(code);
  }
}
