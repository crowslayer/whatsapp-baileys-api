import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class ParticipantPromoter {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IConnectionManager
  ) {}

  async execute(instanceId: InstanceId, groupId: string, participants: string[]): Promise<void> {
    const instance = await this.repository.findById(instanceId.value);

    if (!instance || instance.canSendMessages()) {
      throw new WhatsAppConnectionError(`Instance not found or connected`);
    }

    const adapter = this.connectionManager.getConnection(instance.instanceId);

    if (!adapter) {
      throw new WhatsAppConnectionError(`Instance not found or connected`);
    }

    await adapter.promoteParticipants(groupId, participants);
  }
}
