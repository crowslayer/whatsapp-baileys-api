import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { DeleteInstanceCommand } from '@modules/instances/application/delete/DeleteInstanceCommand';
import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';

export class InstancesEraser {
  constructor(
    private readonly repository: IInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(command: DeleteInstanceCommand): Promise<void> {
    await this.repository.delete(InstanceId.fromString(command.instanceId));
    await this.runtimeManager.stop(command.instanceId);
  }
}
