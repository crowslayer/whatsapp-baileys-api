import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { Name } from '@domain/value-objects/Name';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { ConflictError } from '@shared/infrastructure/errors/ConflictError';

import { CreateInstanceCommand } from './CreateInstanceCommand';

export class InstancesCreator {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IConnectionManager
  ) {}

  async execute(command: CreateInstanceCommand): Promise<WhatsAppInstanceAggregate> {
    const name = Name.create(command.name);

    const existingInstance = await this.repository.findByName(name.value);
    if (existingInstance) {
      throw new ConflictError(`Instance with name '${command.name}' already exists`);
    }

    const instance = WhatsAppInstanceAggregate.create(name, command.webhookUrl);
    await this.repository.save(instance);

    if (command.usePairingCode && command.phoneNumber) {
      await this.connectionManager.createConnection(instance.instanceId, true, command.phoneNumber);
    } else {
      await this.connectionManager.createConnection(instance.instanceId, false);
    }

    return instance;
  }
}
