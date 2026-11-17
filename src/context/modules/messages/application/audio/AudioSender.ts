import { DomainError } from '@shared/domain/error/DomainError';
import { ValidationError } from '@shared/domain/error/ValidationError';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { SendAudioCommand } from '@modules/messages/application/audio/SendAudioCommand';
import { MessageError } from '@modules/messages/application/MessageError';

export class AudioSender {
  constructor(
    private repository: IInstanceRepository,
    private runtimeManager: IRuntimeManager
  ) {}

  async execute(command: SendAudioCommand): Promise<ISentMessage> {
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

      const ptt = command.ptt ? command.ptt : false;

      const result = await adapter.messaging.sendAudio(command.to, command.audio, ptt);

      if (!result) {
        throw new MessageError('Audio message not sended');
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
