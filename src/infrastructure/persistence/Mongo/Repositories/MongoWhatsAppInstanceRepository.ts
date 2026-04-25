import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { ConnectionStatus, ConnectionStatusEnum } from '@domain/value-objects/ConnectionStatus';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';
import { PhoneNumber } from '@domain/value-objects/PhoneNumber';

import {
  IWhatsAppInstanceDocument,
  WhatsAppInstanceModel,
} from '@infrastructure/persistence/mongo/models/WhatsAppInstanceModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoWhatsAppInstanceRepository implements IWhatsAppInstanceRepository {
  async save(instance: WhatsAppInstanceAggregate): Promise<void> {
    try {
      const document = new WhatsAppInstanceModel({
        instanceId: instance.instanceId,
        name: instance.name.value,
        status: instance.status.value,
        phoneNumber: instance.phoneNumber?.value,
        // qrCode: instance.qrCode,
        // qrText: instance.qrText,
        // pairingCode: instance.pairingCode,
        webhookUrl: instance.webhookUrl,
        // sessionData: instance.sessionData,
        lastConnectedAt: instance.lastConnectedAt,
      });

      await document.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
      }
      throw error;
    }
  }

  async findById(instanceId: string): Promise<WhatsAppInstanceAggregate | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId });
      if (!document) return null;

      return this.toDomain(document);
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
      }
      throw error;
    }
  }

  async findByName(name: string): Promise<WhatsAppInstanceAggregate | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ name });
      if (!document) return null;

      return this.toDomain(document);
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
      }
      throw error;
    }
  }

  async findAll(): Promise<WhatsAppInstanceAggregate[]> {
    try {
      const documents = await WhatsAppInstanceModel.find().sort({ createdAt: -1 });
      return documents.map((doc) => this.toDomain(doc));
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
      }
      throw error;
    }
  }

  async update(instance: WhatsAppInstanceAggregate): Promise<void> {
    try {
      await WhatsAppInstanceModel.updateOne(
        { instanceId: instance.instanceId },
        {
          $set: {
            name: instance.name.value,
            status: instance.status.value,
            phoneNumber: instance.phoneNumber?.value,
            // qrCode: instance.qrCode,
            // qrText: instance.qrText,
            // pairingCode: instance.pairingCode,
            webhookUrl: instance.webhookUrl,
            // sessionData: instance.sessionData,
            lastConnectedAt: instance.lastConnectedAt,
            updatedAt: new Date(),
          },
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
      }
      throw error;
    }
  }

  async delete(instanceId: string): Promise<void> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId });
      if (!document) return;

      await WhatsAppInstanceModel.deleteOne({ instanceId });
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
      }
      throw error;
    }
  }

  async exists(instanceId: string): Promise<boolean> {
    try {
      const count = await WhatsAppInstanceModel.countDocuments({ instanceId });
      return count > 0;
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
      }
      throw error;
    }
  }

  private toDomain(document: IWhatsAppInstanceDocument): WhatsAppInstanceAggregate {
    return WhatsAppInstanceAggregate.restore({
      instanceId: InstanceId.fromString(document.instanceId),
      name: Name.create(document.name),
      status: ConnectionStatus.create(document.status as ConnectionStatusEnum),
      phoneNumber: document.phoneNumber ? PhoneNumber.create(document.phoneNumber) : undefined,
      // qrCode: document.qrCode,
      // qrText: document.qrText,
      // pairingCode: document.pairingCode,
      webhookUrl: document.webhookUrl,
      // sessionData: document.sessionData,
      lastConnectedAt: document.lastConnectedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
