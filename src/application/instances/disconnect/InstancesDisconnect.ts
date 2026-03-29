import { DisconnectInstanceCommand } from '@application/instances/disconnect/DisconnectInstanceCommand';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

export class InstancesDisconnect {
  constructor(private readonly manager: IConnectionManager) {}

  async execute(command: DisconnectInstanceCommand): Promise<void> {
    await this.manager.disconnectInstance(command.instanceId);
  }
}
