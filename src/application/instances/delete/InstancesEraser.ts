import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { DeleteInstanceCommand } from '@application/instances/delete/DeleteInstanceCommand';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

export class InstancesEraser {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: IConnectionManager
  ) {}

  async execute(command: DeleteInstanceCommand): Promise<void> {
    await this.repository.delete(command.instanceId);
    await this.connectionManager.logoutInstance(command.instanceId);
  }
}
