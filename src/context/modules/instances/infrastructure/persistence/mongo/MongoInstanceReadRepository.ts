import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

import {
  IInstanceReadRepository,
  InstanceReadModel,
} from '@modules/instances/domain/IInstanceReadRepository';
import { WhatsAppInstanceModel } from '@modules/instances/infrastructure/persistence/mongo/WhatsAppInstanceModel';

export class MongoInstanceReadRepository
  extends MongoRepository
  implements IInstanceReadRepository
{
  async findById(instanceId: string): Promise<InstanceReadModel | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId })
        .lean<InstanceReadModel>()
        .exec();

      return document ?? null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findByName(name: string): Promise<InstanceReadModel | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ name })
        .lean<InstanceReadModel>()
        .exec();

      return document ?? null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findAll(): Promise<InstanceReadModel[]> {
    try {
      return await WhatsAppInstanceModel.find()
        .sort({ createdAt: -1 })
        .lean<InstanceReadModel[]>()
        .exec();
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async exists(instanceId: string): Promise<boolean> {
    try {
      const count = await WhatsAppInstanceModel.countDocuments({ instanceId }).exec();

      return count > 0;
    } catch (error: unknown) {
      throw this.translateError(error);
    }
  }
}
