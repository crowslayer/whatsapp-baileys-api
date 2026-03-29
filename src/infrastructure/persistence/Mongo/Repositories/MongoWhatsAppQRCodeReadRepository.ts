import {
  IWhatsAppQRCodeReadProjection,
  IWhatsAppQRCodeReadRepository,
} from '@domain/queries/IWhatsAppQRCodeReadRepository';

import { WhatsAppInstanceModel } from '@infrastructure/persistence/mongo/models/WhatsAppInstanceModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoWhatsAppQRCodeReadRepository implements IWhatsAppQRCodeReadRepository {
  async findById(instanceId: string): Promise<IWhatsAppQRCodeReadProjection | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId })
        .lean<IWhatsAppQRCodeReadProjection>()
        .exec();

      return document ?? null;
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to find WhatsApp instance by id`, error);
    }
  }

  async findByName(name: string): Promise<IWhatsAppQRCodeReadProjection | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ name })
        .lean<IWhatsAppQRCodeReadProjection>()
        .exec();

      return document ?? null;
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to find WhatsApp instance by name`, error);
    }
  }
}
