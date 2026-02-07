import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { GetInstanceQuery } from '@application/queries/GetInstanceQuery';

import { NotFoundError } from '@shared/infrastructure/Error/NotFoundError';

export class GetInstanceHandler {
  constructor(private repository: IWhatsAppInstanceRepository) {}

  async execute(query: GetInstanceQuery): Promise<WhatsAppInstanceAggregate> {
    const instance = await this.repository.findById(query.instanceId);
    if (!instance) {
      throw new NotFoundError(`Instance ${query.instanceId} not found`);
    }
    return instance;
  }
}
