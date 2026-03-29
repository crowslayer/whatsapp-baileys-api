import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendImageCommand } from '@application/messages/image/SendImageCommand';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class ImageSender {
  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: IConnectionManager
  ) {}

  async execute(command: SendImageCommand): Promise<void> {
    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
    }

    if (!instance.canSendMessages()) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} is not connected` },
      ]);
    }

    const adapter = this.connectionManager.getConnection(command.instanceId);
    if (!adapter) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} adapter not found` },
      ]);
    }

    await adapter.sendImage(command.to, command.image, command.caption);
  }
}
