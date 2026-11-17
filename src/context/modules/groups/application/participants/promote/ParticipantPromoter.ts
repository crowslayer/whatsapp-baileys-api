import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class ParticipantPromoter {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(instanceId: InstanceId, groupId: string, participants: string[]): Promise<void> {
    const instance = await this.repository.findById(instanceId);

    if (!instance || !instance.canSendMessages()) {
      throw new WhatsAppConnectionError(`Instance not found or connected`);
    }

    const adapter = this.runtimeManager.get(instance.instanceId);

    if (!adapter) {
      throw new WhatsAppConnectionError(`Instance not found or connected`);
    }

    await adapter.groups.promoteParticipants(groupId, participants);
  }
}
