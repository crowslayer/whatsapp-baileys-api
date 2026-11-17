import { DatabasePersistenceError } from '@shared/infrastructure/persistence/error/DatabasePersistenceError';
import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

import { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import {
  IWhatsAppInstanceDocument,
  WhatsAppInstanceModel,
} from '@modules/instances/infrastructure/persistence/mongo/WhatsAppInstanceModel';

export class MongoInstanceRepository extends MongoRepository implements IInstanceRepository {
  private toAggregate(document: IWhatsAppInstanceDocument): InstanceAggregate {
    return InstanceAggregate.fromPrimitives(document);
  }

  private toPersistence(instance: InstanceAggregate) {
    return {
      instanceId: instance.instanceId,
      name: instance.name.value,
      status: instance.status.value,
      phoneNumber: instance.phoneNumber?.value,
      webhookUrl: instance.webhookUrl,
      lastConnectedAt: instance.lastConnectedAt,
      createdAt: instance.createdAt,
    };
  }

  async save(instance: InstanceAggregate): Promise<void> {
    try {
      const existingInstance = await WhatsAppInstanceModel.findOne({ name: instance.name.value });
      if (existingInstance) {
        throw new DatabasePersistenceError('Instance with this name already exists');
      }

      const document = new WhatsAppInstanceModel(this.toPersistence(instance));

      await document.save();
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findById(instanceId: InstanceId): Promise<InstanceAggregate | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId });
      if (!document) return null;

      return this.toAggregate(document);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findByName(name: string): Promise<InstanceAggregate | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ name });
      if (!document) return null;

      return this.toAggregate(document);
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findInstances(): Promise<InstanceAggregate[]> {
    try {
      const documents = await WhatsAppInstanceModel.find();
      if (!documents) return [];

      return documents.map((document) => this.toAggregate(document));
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async update(instance: InstanceAggregate): Promise<void> {
    try {
      await WhatsAppInstanceModel.updateOne(
        { instanceId: instance.instanceId },
        {
          $set: {
            name: instance.name.value,
            status: instance.status.value,
            phoneNumber: instance.phoneNumber?.value,
            webhookUrl: instance.webhookUrl,
            lastConnectedAt: instance.lastConnectedAt,
            updatedAt: instance.updatedAt,
          },
        }
      );
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async delete(instanceId: InstanceId): Promise<void> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId });
      if (!document) return;

      await WhatsAppInstanceModel.deleteOne({ instanceId });
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async exists(instanceId: InstanceId): Promise<boolean> {
    try {
      const count = await WhatsAppInstanceModel.countDocuments({ instanceId });
      return count > 0;
    } catch (error) {
      throw this.translateError(error);
    }
  }
}
