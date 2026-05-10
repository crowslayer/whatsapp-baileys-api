import {
  IWhatsAppInstanceReadProjection,
  IWhatsAppInstanceReadRepository,
} from '@domain/queries/IWhatsAppInstanceReadRepository';

import { WhatsAppInstanceModel } from '@infrastructure/persistence/mongo/models/WhatsAppInstanceModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoWhatsAppInstanceReadRepository implements IWhatsAppInstanceReadRepository {
  async findById(instanceId: string): Promise<IWhatsAppInstanceReadProjection | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId })
        .lean<IWhatsAppInstanceReadProjection>()
        .exec();

      return document ?? null;
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to find WhatsApp instance by id`, error);
    }
  }

  async findByName(name: string): Promise<IWhatsAppInstanceReadProjection | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ name })
        .lean<IWhatsAppInstanceReadProjection>()
        .exec();

      return document ?? null;
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to find WhatsApp instance by name`, error);
    }
  }

  async findAll(): Promise<IWhatsAppInstanceReadProjection[]> {
    try {
      return await WhatsAppInstanceModel.find()
        .sort({ createdAt: -1 })
        .lean<IWhatsAppInstanceReadProjection[]>()
        .exec();
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to find all WhatsApp instances`, error);
    }
  }

  async exists(instanceId: string): Promise<boolean> {
    try {
      const count = await WhatsAppInstanceModel.countDocuments({ instanceId }).exec();

      return count > 0;
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to check if WhatsApp instance exists`, error);
    }
  }
}
