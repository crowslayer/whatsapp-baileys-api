import { ConnectInstanceCommand } from '@application/instances/connect/ConnectInstanceCommand';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

export class InstancesConnect {
  constructor(private readonly manager: IConnectionManager) {}

  async execute(command: ConnectInstanceCommand): Promise<void> {
    if (command.usePairingCode && command.phoneNumber) {
      await this.manager.createConnection(
        command.instanceId,
        command.usePairingCode,
        command.phoneNumber
      );
    } else {
      await this.manager.createConnection(command.instanceId, false);
    }
  }
}
