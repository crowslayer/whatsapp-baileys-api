import { ValidationError } from '@shared/domain/error/ValidationError';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';
import { SendLocationCommand } from '@modules/messages/application/location/SendLocationCommand';

export class LocationSender {
  constructor(
    private repository: IInstanceRepository,
    private runtimeManager: IRuntimeManager
  ) {}

  async execute(command: SendLocationCommand): Promise<void> {
    const instance = await this.repository.findById(InstanceId.fromString(command.instanceId));
    if (!instance) {
      throw new InstanceNotFoundError(`Instance ${command.instanceId} not found`);
    }

    if (!instance.canSendMessages()) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} is not connected` },
      ]);
    }

    const adapter = this.runtimeManager.get(command.instanceId);
    if (!adapter) {
      throw new ValidationError([
        { field: 'instance', message: `Instance ${command.instanceId} adapter not found` },
      ]);
    }

    await adapter.messaging.sendLocation(
      command.to,
      command.latitude,
      command.longitude,
      command.name,
      command.address
    );
  }
}
