import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class SettingUpdater {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(
    instanceId: InstanceId,
    groupId: string,
    setting: 'announcement' | 'not_announcement' | 'locked' | 'unlocked'
  ): Promise<void> {
    const instance = await this.repository.findById(instanceId);

    if (!instance || !instance.canSendMessages()) {
      throw new WhatsAppConnectionError('WhatsApp Instance not found or not connected');
    }

    const adapter = this.runtimeManager.get(instanceId.value);

    if (!adapter) {
      throw new WhatsAppConnectionError('WhatsApp Instance not connected or not found');
    }

    await adapter.groups.updateGroupSettings(groupId, setting);
  }
}
