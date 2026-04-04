import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendMessageCommand } from '@application/messages/text/SendMessageCommand';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class TextMessageSender {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IConnectionManager
  ) {}

  async execute(command: SendMessageCommand): Promise<void> {
    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }

    if (!instance.canSendMessages()) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} is not connected` },
      ]);
    }

    await this.connectionManager.sendMessage(instance.id, command.to, command.message);
  }
}
