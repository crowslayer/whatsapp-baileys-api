import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';

export interface IWhatsAppInstanceRepository {
  save(instance: WhatsAppInstanceAggregate): Promise<void>;
  findById(instanceId: string): Promise<WhatsAppInstanceAggregate | null>;
  findByName(name: string): Promise<WhatsAppInstanceAggregate | null>;
  findAll(): Promise<WhatsAppInstanceAggregate[]>;
  update(instance: WhatsAppInstanceAggregate): Promise<void>;
  delete(instanceId: string): Promise<void>;
  exists(instanceId: string): Promise<boolean>;
}
