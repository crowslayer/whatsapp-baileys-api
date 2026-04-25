import { DisconnectInstanceCommand } from '@application/instances/disconnect/DisconnectInstanceCommand';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

export class InstancesDisconnect {
  constructor(private readonly manager: IRuntimeManager) {}

  async execute(command: DisconnectInstanceCommand): Promise<void> {
    await this.manager.stop(command.instanceId);
  }
}
