import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

import { DisconnectInstanceCommand } from './DisconnectInstanceCommand';

export class InstancesDisconnect {
  constructor(private readonly manager: IConnectionManager) {}

  async execute(command: DisconnectInstanceCommand): Promise<void> {
    await this.manager.disconnectInstance(command.instanceId);
  }
}
