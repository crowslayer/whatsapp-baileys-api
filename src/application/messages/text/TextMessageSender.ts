import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class TextMessageSender {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IRuntimeManager
  ) {}

  async execute(instanceId: string, jid: string, message: string): Promise<void> {
    const instance = await this.repository.findById(instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${instanceId} not found`);
    }

    if (!instance.canSendMessages()) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${instanceId} is not connected` },
      ]);
    }

    const runtime = this.connectionManager.get(instance.id);

    await runtime.messaging.sendText(jid, message);
  }
}
