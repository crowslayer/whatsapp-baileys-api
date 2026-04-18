import { ConnectInstanceCommand } from '@application/instances/connect/ConnectInstanceCommand';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

export class InstancesConnect {
  constructor(private readonly manager: IRuntimeManager) {}

  async execute(command: ConnectInstanceCommand): Promise<void> {
    if (command.usePairingCode && command.phoneNumber) {
      // await this.manager.createConnection(
      //   command.instanceId,
      //   command.usePairingCode,
      //   command.phoneNumber
      // );
      await this.manager.start(command.instanceId, command.phoneNumber);
    } else {
      await this.manager.start(command.instanceId);
    }
  }
}
