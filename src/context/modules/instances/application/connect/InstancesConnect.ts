import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { ConnectInstanceCommand } from '@modules/instances/application/connect/ConnectInstanceCommand';

export class InstancesConnect {
  constructor(private readonly manager: IRuntimeManager) {}

  async execute(command: ConnectInstanceCommand): Promise<void> {
    if (command.usePairingCode && command.phoneNumber) {
      await this.manager.start(command.instanceId, command.phoneNumber);
    } else {
      await this.manager.start(command.instanceId);
    }
  }
}
