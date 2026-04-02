import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class LinkGroupRevoker {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IConnectionManager
  ) {}

  async execute(instanceId: InstanceId, groupId: string): Promise<string> {
    const instance = await this.repository.findById(instanceId.value);
    if (!instance || !instance.canSendMessages()) {
      throw new WhatsAppConnectionError('WhatsApp Instance not found or not connected');
    }

    const adapter = this.connectionManager.getConnection(instanceId.value);
    if (!adapter) {
      throw new WhatsAppConnectionError('WhatsApp Instance not connected or not found');
    }
    return await adapter.revokeGroupInviteLink(groupId);
  }
}
