import {
  IWhatsAppInstanceReadProjection,
  IWhatsAppInstanceReadRepository,
  WhatsAppInstance,
} from '@domain/queries/IWhatsAppInstanceReadRepository';

export class InstancesSearcher {
  constructor(private readonly repository: IWhatsAppInstanceReadRepository) {}

  async execute(): Promise<WhatsAppInstance[]> {
    const instances = await this.repository.findAll();
    return instances.map((instance) => this.toReadModel(instance));
  }

  private toReadModel(instance: IWhatsAppInstanceReadProjection): WhatsAppInstance {
    return {
      instanceId: instance.instanceId,
      name: instance.name,
      status: instance.status,
      phoneNumber: instance.phoneNumber ?? undefined,
      webhookUrl: instance.webhookUrl ?? undefined,
      lastConnectedAt: instance.lastConnectedAt ?? undefined,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
    };
  }
}
