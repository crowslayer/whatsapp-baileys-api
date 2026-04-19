import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';

import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

export class GroupLeaver {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(instanceId: InstanceId, groupId: string): Promise<void> {
    const instance = await this.repository.findById(instanceId.value);

    if (!instance || !instance.canSendMessages()) {
      throw new WhatsAppConnectionError('WhatsApp Instance not found or not connected');
    }

    const adapter = this.runtimeManager.get(instanceId.value);

    if (!adapter) {
      throw new WhatsAppConnectionError('WhatsApp Instance not connected or not found');
    }

    return await adapter.groups.leaveGroup(groupId);
  }
}
