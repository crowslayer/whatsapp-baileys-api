import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { DeleteInstanceCommand } from '@application/instances/delete/DeleteInstanceCommand';
import { IRuntimeManager } from '@application/runtime/IRuntimeManager';

export class InstancesEraser {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly runtimeManager: IRuntimeManager
  ) {}

  async execute(command: DeleteInstanceCommand): Promise<void> {
    await this.repository.delete(command.instanceId);
    await this.runtimeManager.stop(command.instanceId);
  }
}
