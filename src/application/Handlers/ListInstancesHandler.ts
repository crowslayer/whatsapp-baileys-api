import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { ListInstancesQuery } from '@application/queries/ListInstancesQuery';

export class ListInstancesHandler {
  constructor(private repository: IWhatsAppInstanceRepository) {}

  async execute(_query: ListInstancesQuery): Promise<WhatsAppInstanceAggregate[]> {
    return await this.repository.findAll();
  }
}
