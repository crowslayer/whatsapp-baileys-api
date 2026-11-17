import { DomainError } from '@shared/domain/error/DomainError';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';

export class NotifyInstanceConnected {
  constructor(private readonly repository: IInstanceRepository) {}

  async execute(params: { instanceId: string; phoneNumber: string }): Promise<void> {
    try {
      const instance = await this.repository.findById(InstanceId.fromString(params.instanceId));

      if (!instance) throw new InstanceNotFoundError('Instance not found');

      instance.connect(params.phoneNumber);

      await this.repository.save(instance);
    } catch (error) {
      if (error instanceof DomainError) throw error;

      throw error;
    }
  }
}
