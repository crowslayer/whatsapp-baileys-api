import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendReactionCommand } from '@application/commands/SendReactionCommand';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { NotFoundError } from '@shared/infrastructure/Error/NotFoundError';
import { ValidationError } from '@shared/infrastructure/Error/ValidationError';

export class SendReactionHandler {
  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async execute(command: SendReactionCommand): Promise<void> {
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

    await adapter.sendReaction(command.chatId, command.messageId, command.emoji);
  }
}
