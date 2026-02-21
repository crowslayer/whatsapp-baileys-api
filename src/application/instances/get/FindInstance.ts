import {
  IWhatsAppInstanceReadRepository,
  WhatsAppInstance,
} from '@domain/queries/IWhatsAppInstanceReadRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';

export class FindInstance {
  constructor(private readonly repository: IWhatsAppInstanceReadRepository) {}

  async execute(id: InstanceId): Promise<WhatsAppInstance> {
    const instance = await this.repository.findById(id.value);

    if (!instance) {
      throw new Error('Instance not found');
    }
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
