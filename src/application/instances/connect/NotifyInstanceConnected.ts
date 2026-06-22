import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class NotifyInstanceConnected {
  constructor(private readonly repository: IWhatsAppInstanceRepository) {}

  async execute(params: { instanceId: string; phoneNumber: string }): Promise<void> {
    try {
      const instance = await this.repository.findById(params.instanceId);

      if (!instance) throw new NotFoundError('Instance not found');

      instance.connect(params.phoneNumber);

      this.repository.save(instance);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;

      throw new Error('Internal Error');
    }
  }
}
