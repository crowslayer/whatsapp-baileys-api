import { ListInstancesQuery } from "@application/Queries/ListInstancesQuery";
import { WhatsAppInstanceAggregate } from "@domain/Aggregates/WhatsAppInstanceAggregate";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";

export class ListInstancesHandler {
    constructor(private repository: IWhatsAppInstanceRepository) {}
  
    async execute(query: ListInstancesQuery): Promise<WhatsAppInstanceAggregate[]> {
      return await this.repository.findAll();
    }
  }