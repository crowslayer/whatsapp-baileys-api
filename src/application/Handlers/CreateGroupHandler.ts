import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { CreateGroupCommand } from '@application/commands/CreateGroupCommand';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { NotFoundError } from '@shared/infrastructure/Error/NotFoundError';
import { ValidationError } from '@shared/infrastructure/Error/ValidationError';

export class CreateGroupHandler {
  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async execute(command: CreateGroupCommand): Promise<string> {
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

    return await adapter.createGroup(command.name, command.participants);
  }
}
