import { WhatsAppInstanceAggregate } from '@domain/aggregates/WhatsAppInstanceAggregate';
import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';
import { ConnectionStatus } from '@domain/value-objects/ConnectionStatus';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { PhoneNumber } from '@domain/value-objects/PhoneNumber';

import { WhatsAppInstanceModel } from '@infrastructure/persistence/mongo/models/WhatsAppInstanceModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoWhatsAppInstanceRepository implements IWhatsAppInstanceRepository {
  async save(instance: WhatsAppInstanceAggregate): Promise<void> {
    try {
      const document = new WhatsAppInstanceModel({
        instanceId: instance.instanceId,
        name: instance.name,
        status: instance.status.value,
        phoneNumber: instance.phoneNumber?.value,
        qrCode: instance.qrCode,
        qrText: instance.qrText,
        pairingCode: instance.pairingCode,
        webhookUrl: instance.webhookUrl,
        sessionData: instance.sessionData,
        lastConnectedAt: instance.lastConnectedAt,
      });

      await document.save();
    } catch (error: any) {
      throw new InfrastructureError(`Failed to save WhatsApp instance: ${error.message}`, error);
    }
  }

  async findById(instanceId: string): Promise<WhatsAppInstanceAggregate | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ instanceId });
      if (!document) return null;

      return this.toDomain(document);
    } catch (error: any) {
      throw new InfrastructureError(`Failed to find WhatsApp instance: ${error.message}`, error);
    }
  }

  async findByName(name: string): Promise<WhatsAppInstanceAggregate | null> {
    try {
      const document = await WhatsAppInstanceModel.findOne({ name });
      if (!document) return null;

      return this.toDomain(document);
    } catch (error: any) {
      throw new InfrastructureError(
        `Failed to find WhatsApp instance by name: ${error.message}`,
        error
      );
    }
  }

  async findAll(): Promise<WhatsAppInstanceAggregate[]> {
    try {
      const documents = await WhatsAppInstanceModel.find().sort({ createdAt: -1 });
      return documents.map((doc) => this.toDomain(doc));
    } catch (error: any) {
      throw new InfrastructureError(
        `Failed to find all WhatsApp instances: ${error.message}`,
        error
      );
    }
  }

  async update(instance: WhatsAppInstanceAggregate): Promise<void> {
    try {
      await WhatsAppInstanceModel.updateOne(
        { instanceId: instance.instanceId },
        {
          $set: {
            name: instance.name,
            status: instance.status.value,
            phoneNumber: instance.phoneNumber?.value,
            qrCode: instance.qrCode,
            qrText: instance.qrText,
            pairingCode: instance.pairingCode,
            webhookUrl: instance.webhookUrl,
            sessionData: instance.sessionData,
            lastConnectedAt: instance.lastConnectedAt,
            updatedAt: new Date(),
          },
        }
      );
    } catch (error: any) {
      throw new InfrastructureError(`Failed to update WhatsApp instance: ${error.message}`, error);
    }
  }

  async delete(instanceId: string): Promise<void> {
    try {
      await WhatsAppInstanceModel.deleteOne({ instanceId });
    } catch (error: any) {
      throw new InfrastructureError(`Failed to delete WhatsApp instance: ${error.message}`, error);
    }
  }

  async exists(instanceId: string): Promise<boolean> {
    try {
      const count = await WhatsAppInstanceModel.countDocuments({ instanceId });
      return count > 0;
    } catch (error: any) {
      throw new InfrastructureError(
        `Failed to check if WhatsApp instance exists: ${error.message}`,
        error
      );
    }
  }

  private toDomain(document: any): WhatsAppInstanceAggregate {
    return WhatsAppInstanceAggregate.restore({
      instanceId: InstanceId.create(document.instanceId),
      name: document.name,
      status: ConnectionStatus.create(document.status),
      phoneNumber: document.phoneNumber ? PhoneNumber.create(document.phoneNumber) : undefined,
      qrCode: document.qrCode,
      qrText: document.qrText,
      pairingCode: document.pairingCode,
      webhookUrl: document.webhookUrl,
      sessionData: document.sessionData,
      lastConnectedAt: document.lastConnectedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
