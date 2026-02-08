import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { CreateInstanceCommand } from '@application/commands/CreateInstanceCommand';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { ConflictError } from '@shared/infrastructure/errors/ConflictError';

export class CreateInstanceHandler {
  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async execute(command: CreateInstanceCommand): Promise<WhatsAppInstanceAggregate> {
    const existingInstance = await this.repository.findByName(command.name);
    if (existingInstance) {
      throw new ConflictError(`Instance with name '${command.name}' already exists`);
    }

    const instance = WhatsAppInstanceAggregate.create(command.name, command.webhookUrl);
    await this.repository.save(instance);

    if (command.usePairingCode && command.phoneNumber) {
      await this.connectionManager.createConnection(instance.instanceId, true, command.phoneNumber);
    } else {
      await this.connectionManager.createConnection(instance.instanceId);
    }

    return instance;
  }
}
