import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class GroupInviteAccepted {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(instanceId: InstanceId, code: string): Promise<string | undefined> {
    const instance = await this.repository.findById(instanceId);
    if (!instance || !instance.canSendMessages()) {
      throw new WhatsAppConnectionError('WhatsApp Instance not found or not connected');
    }

    const adapter = this.runtimeManager.get(instanceId.value);
    if (!adapter) {
      throw new WhatsAppConnectionError('WhatsApp Instance not connected or not found');
    }
    return await adapter.groups.acceptGroupInvite(code);
  }
}
