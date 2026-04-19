import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendVideoCommand } from '@application/messages/video/SendVideoCommand';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class VideoSender {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(command: SendVideoCommand): Promise<void> {
    const instance = await this.repository.findById(command.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${command.instanceId} not found`);
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

    await adapter.messaging.sendVideo(
      command.to,
      command.video,
      command.caption,
      command.gifPlayback
    );
  }
}
