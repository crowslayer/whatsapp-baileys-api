import { GetInstanceQuery } from "@application/Queries/GetInstanceQuery";
import { WhatsAppInstanceAggregate } from "@domain/Aggregates/WhatsAppInstanceAggregate";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { NotFoundError } from "@shared/infrastructure/ErrorHandler";

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