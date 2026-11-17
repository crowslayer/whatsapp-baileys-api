import { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';
import { ValidationError } from '@shared/domain/error/ValidationError';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { SendMessageCommand } from '@modules/messages/application/text/SendMessageCommand';

type MessageData = Omit<SendMessageCommand, 'to'> & { jid: string };

export class TextMessageSender {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly messageOrchestrator: MessageOrchestrator
  ) {}

  async execute(command: MessageData): Promise<void> {
    const instance = await this.repository.findById(InstanceId.fromString(command.instanceId));
    if (!instance) {
      throw new InstanceNotFoundError(`Instance ${command.instanceId} not found`);
    }

    if (!instance.canSendMessages()) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} is not connected` },
      ]);
    }

    this.messageOrchestrator.send(instance.instanceId, command.jid, command.message);
  }
}
