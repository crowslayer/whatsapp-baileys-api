import { DomainError } from '@shared/domain/error/DomainError';
import { ValidationError } from '@shared/domain/error/ValidationError';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { SendContactCommand } from '@modules/messages/application/contact/SendContactCommand';
import { MessageError } from '@modules/messages/application/MessageError';

export class ContactSender {
  constructor(
    private repository: IInstanceRepository,
    private runtimeManager: IRuntimeManager
  ) {}

  async execute(command: SendContactCommand): Promise<ISentMessage> {
    try {
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

      const result = await adapter.messaging.sendContact(command.to, command.contacts);

      if (!result) {
        throw new MessageError('Contact not sender');
      }

      return result;
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw error;
    }
  }
}
