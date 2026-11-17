import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { DisconnectInstanceCommand } from '@modules/instances/application/disconnect/DisconnectInstanceCommand';

export class InstancesDisconnect {
  constructor(private readonly runtimeManager: IRuntimeManager) {}

  async execute(command: DisconnectInstanceCommand): Promise<void> {
    await this.runtimeManager.stop(command.instanceId);
  }
}
