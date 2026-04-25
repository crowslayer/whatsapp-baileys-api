import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendDocumentCommand } from '@application/messages/document/SendDocumentCommand';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ValidationError } from '@shared/infrastructure/errors/ValidationError';

export class DocumentSender {
  constructor(
    private repository: IWhatsAppInstanceRepository,
    private runtimeManager: IRuntimeManager
  ) {}

  async execute(command: SendDocumentCommand): Promise<void> {
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

    await adapter.messaging.sendDocument(
      command.to,
      command.document,
      command.fileName,
      command.mimetype,
      command.caption
    );
  }
}
