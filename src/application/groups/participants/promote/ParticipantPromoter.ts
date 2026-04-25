import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';

import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class ParticipantPromoter {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(instanceId: InstanceId, groupId: string, participants: string[]): Promise<void> {
    const instance = await this.repository.findById(instanceId.value);

    if (!instance || instance.canSendMessages()) {
      throw new WhatsAppConnectionError(`Instance not found or connected`);
    }

    const adapter = this.runtimeManager.get(instance.instanceId);

    if (!adapter) {
      throw new WhatsAppConnectionError(`Instance not found or connected`);
    }

    await adapter.groups.promoteParticipants(groupId, participants);
  }
}
