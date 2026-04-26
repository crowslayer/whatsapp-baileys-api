import {
  CampaignAggregate,
  CampaignStatus,
  ICampaignRecipient,
} from '@domain/campaign/CampaignAggregate';
import { CampaignId } from '@domain/campaign/CampaignId';
import { Description } from '@domain/campaign/Description';
import { ICampaignRepository } from '@domain/campaign/ICampaignRepository';
import { InstanceId } from '@domain/value-objects/InstanceId';
import { Name } from '@domain/value-objects/Name';

import {
  CampaignModel,
  ICampaignDocument,
} from '@infrastructure/persistence/mongo/models/CampaignModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoCampaignRepository implements ICampaignRepository {
  async findById(campaignId: CampaignId): Promise<CampaignAggregate> {
    const document = await CampaignModel.findOne({ campaignId: campaignId.value });

    if (!document) {
      throw new Error('Campaign not exist');
    }

    return this.toDomain(document);
  }

  async save(instance: CampaignAggregate): Promise<void> {
    try {
      await CampaignModel.updateOne(
        { campaignId: instance.campaignId.value },
        {
          $set: {
            instanceId: instance.instanceId.value,
            name: instance.name.value,
            description: instance.description.value,
            status: instance.status,
            message: instance.message,
            recipients: instance.recipients,
            currentIndex: instance.currentIndex,
            lockedAt: instance.lockedAt ?? null,
            lockedBy: instance.lockedBy ?? null,
            lockExpiresAt: instance.lockExpiresAt ?? null,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: instance.createdAt ?? new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to save Campaign instance: ${error.message}`, error);
      }
      throw error;
    }
  }
  async lockNext(workerId: string): Promise<CampaignAggregate | null> {
    const now = new Date();

    const model = await CampaignModel.findOneAndUpdate(
      {
        status: 'running',
        $expr: {
          $lt: ['$currentIndex', { $size: '$recipients' }],
        },
        $or: [{ lockedBy: null }, { lockExpiresAt: { $lt: now } }],
      },
      {
        $set: {
          lockedBy: workerId,
          lockedAt: now,
          lockExpiresAt: new Date(now.getTime() + 60000),
        },
      },
      {
        sort: { updatedAt: 1 },
        new: true,
      }
    );

    return model ? this.toDomain(model) : null;
  }

  async extendLock(campaignId: CampaignId, workerId: string): Promise<void> {
    await CampaignModel.updateOne(
      {
        campaignId: campaignId.value,
        lockedBy: workerId,
        lockExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          lockExpiresAt: new Date(Date.now() + 60000),
        },
      }
    );
  }

  async releaseLock(campaignId: CampaignId, workerId: string): Promise<void> {
    await CampaignModel.updateOne(
      { campaignId: campaignId.value, lockedBy: workerId },
      {
        $set: {
          lockedBy: null,
          lockedAt: null,
          lockExpiresAt: null,
        },
      }
    );
  }

  // ===============================
  // PROGRESS
  // ===============================
  async updateProgress(
    campaignId: CampaignId,
    index: number,
    recipient: Partial<ICampaignRecipient>
  ): Promise<void> {
    await CampaignModel.updateOne(
      { campaignId: campaignId.value },
      {
        $set: {
          [`recipients.${index}`]: recipient,
          currentIndex: index + 1,
          updatedAt: new Date(),
        },
      }
    );
  }

  // ===============================
  // COMPLETE
  // ===============================
  async complete(campaignId: CampaignId): Promise<void> {
    await CampaignModel.updateOne(
      { campaignId: campaignId.value },
      {
        $set: {
          status: 'completed',
          lockedBy: null,
          lockedAt: null,
          lockExpiresAt: null,
          updatedAt: new Date(),
        },
      }
    );
  }
  // ===============================
  // DELETE
  // ===============================
  async delete(campaignId: CampaignId): Promise<void> {
    try {
      await CampaignModel.deleteOne({
        campaignId: campaignId.value,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new InfrastructureError(`Failed to delete Campaign: ${error.message}`, error);
      }
      throw error;
    }
  }

  // ===============================
  // MAPPER
  // ===============================
  private toDomain(document: ICampaignDocument): CampaignAggregate {
    return CampaignAggregate.restore({
      campaignId: CampaignId.fromString(document.campaignId),
      instanceId: InstanceId.fromString(document.instanceId),
      name: Name.create(document.name),
      description: Description.create(document.description),
      status: document.status as CampaignStatus,
      message: document.message,
      recipients: document.recipients.map((r) => ({ ...r }) as ICampaignRecipient),
      currentIndex: document.currentIndex,
      lockedAt: document.lockedAt,
      lockedBy: document.lockedBy,
      lockExpiresAt: document.lockExpiresAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
