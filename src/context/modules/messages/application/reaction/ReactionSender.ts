import { ValidationError } from '@shared/domain/error/ValidationError';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { SendReactionCommand } from '@modules/messages/application/reaction/SendReactionCommand';

export class ReactionSender {
  constructor(
    private repository: IInstanceRepository,
    private runtimeManager: IRuntimeManager
  ) {}

  async execute(command: SendReactionCommand): Promise<ISentMessage | undefined> {
    const instance = await this.repository.findById(InstanceId.fromString(command.instanceId));
    if (!instance) {
      throw new InstanceNotFoundError(`Instance ${command.instanceId} not found`);
    }

    if (!instance.canSendMessages()) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} is not connected` },
      ]);
    }

    const adapter = this.runtimeManager.get(command.instanceId);
    if (!adapter) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} adapter not found` },
      ]);
    }

    return adapter.messaging.sendReaction(command.message.chatId, command.message, command.emoji);
  }
}
