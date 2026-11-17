import { MongoRepository } from '@shared/infrastructure/persistence/mongo/MongoRepository';

import {
  CampaignAggregate,
  CampaignStatus,
  ICampaignRecipient,
} from '@modules/campaign/domain/CampaignAggregate';
import { CampaignId } from '@modules/campaign/domain/CampaignId';
import { CampaignName } from '@modules/campaign/domain/CampaignName';
import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';
import { CompletedAt } from '@modules/campaign/domain/CompletedAt';
import { Description } from '@modules/campaign/domain/Description';
import { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';
import { LockedAt } from '@modules/campaign/domain/LockedAt';
import { LockExpiresAt } from '@modules/campaign/domain/LockExpiresAt';
import { Message } from '@modules/campaign/domain/Message';
import { ScheduledAt } from '@modules/campaign/domain/ScheduledAt';
import { StartedAt } from '@modules/campaign/domain/StartedAt';
import {
  CampaignModel,
  ICampaignDocument,
} from '@modules/campaign/infrastructure/persistence/mongo/CampaignModel';
import { InstanceId } from '@modules/instances/domain/InstanceId';
import { CreatedAt } from '@modules/shared/domain/CreatedAt';
import { UpdatedAt } from '@modules/shared/domain/UpdatedAt';

export class MongoCampaignRepository extends MongoRepository implements ICampaignRepository {
  async findById(campaignId: CampaignId): Promise<CampaignAggregate> {
    try {
      const document = await CampaignModel.findOne({ campaignId });

      if (!document) {
        throw new CampaignNotFoundError('Campaign not exist');
      }

      return this.toAggregate(document);
    } catch (error) {
      throw this.translateError(error);
    }
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

            lockedAt: instance.lockedAt ?? null,
            lockedBy: instance.lockedBy ?? null,
            lockExpiresAt: instance.lockExpiresAt ?? null,

            scheduledAt: instance.scheduledAt ?? null,
            startedAt: instance.startedAt ?? null,
            completedAt: instance.completedAt ?? null,

            cronExpression: instance.cronExpression ?? null,
            updatedAt: instance.updatedAt,
          },
          $setOnInsert: {
            createdAt: instance.createdAt ?? new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async lockNext(workerId: string): Promise<CampaignAggregate | null> {
    try {
      const now = new Date();

      const model = await CampaignModel.findOneAndUpdate(
        {
          status: 'running',
          recipients: {
            $elemMatch: {
              status: 'pending',
              retryAt: null,
            },
          },

          $or: [{ lockedBy: null }, { lockExpiresAt: { $lt: now } }],
        },
        {
          $set: {
            lockedBy: workerId,
            lockedAt: now,
            lockExpiresAt: new Date(now.getTime() + 120000),
          },
        },
        {
          sort: { updatedAt: 1 },
          new: true,
        }
      );

      return model ? this.toAggregate(model) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findOneAndLock(
    filter: any,
    lockData: {
      lockedBy: string;
      lockedAt: LockedAt;
      lockExpiresAt: LockExpiresAt;
    }
  ): Promise<CampaignAggregate | null> {
    try {
      const doc = await CampaignModel.findOneAndUpdate(
        filter,
        {
          $set: {
            lockedBy: lockData.lockedBy,
            lockedAt: lockData.lockedAt,
            lockExpiresAt: lockData.lockExpiresAt,
          },
        },
        {
          sort: { updatedAt: 1 }, // fairness
          new: true,
        }
      );

      return doc ? this.toAggregate(doc) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async findRetryCandidate(workerId: string): Promise<CampaignAggregate | null> {
    try {
      const now = new Date();

      const doc = await CampaignModel.findOneAndUpdate(
        {
          status: 'running',

          // SOLO campañas con retries listos
          recipients: {
            $elemMatch: {
              status: 'pending',
              retryAt: { $lte: now },
            },
          },

          // lock distribuido
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
          sort: { updatedAt: 1 }, // fairness
          new: true,
        }
      );

      return doc ? this.toAggregate(doc) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async activateNextScheduled(): Promise<CampaignAggregate | null> {
    try {
      const now = new Date();

      const doc = await CampaignModel.findOneAndUpdate(
        {
          status: 'scheduled',
          scheduledAt: { $lte: now },
          lockedBy: null,
        },
        {
          $set: {
            status: 'running',
            startedAt: now,
          },
        },
        {
          sort: { scheduledAt: 1 },
          new: true,
        }
      );

      return doc ? this.toAggregate(doc) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async lockNextRetry(workerId: string): Promise<CampaignAggregate | null> {
    try {
      const now = new Date();

      const document = await CampaignModel.findOneAndUpdate(
        {
          status: 'running',
          recipients: {
            $elemMatch: {
              status: 'pending',
              retryAt: { $lte: now },
            },
          },
          $or: [{ lockedBy: null }, { lockExpiresAt: { $lt: now } }],
        },
        {
          $set: {
            lockedBy: workerId,
            lockedAt: now,
            lockExpiresAt: new Date(now.getTime() + 120000),
          },
        },

        { sort: { updatedAt: 1 }, new: true }
      );

      return document ? this.toAggregate(document) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async extendLock(campaignId: CampaignId, workerId: string): Promise<void> {
    try {
      await CampaignModel.updateOne(
        {
          campaignId: campaignId.value,
          lockedBy: workerId,
          lockExpiresAt: { $gt: new Date() },
        },
        {
          $set: {
            lockExpiresAt: new Date(Date.now() + 120000),
          },
        }
      );
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async releaseLock(campaignId: CampaignId, workerId: string): Promise<void> {
    try {
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
    } catch (error) {
      throw this.translateError(error);
    }
  }

  async startScheduled(now: Date): Promise<CampaignAggregate | null> {
    try {
      const doc = await CampaignModel.findOneAndUpdate(
        {
          status: 'scheduled',
          scheduledAt: { $lte: now },
          lockedBy: null,
        },
        {
          $set: {
            status: 'running',
            startedAt: now,
          },
        },
        {
          sort: { scheduledAt: 1 },
          new: true,
        }
      );

      return doc ? this.toAggregate(doc) : null;
    } catch (error) {
      throw this.translateError(error);
    }
  }

  // ===============================
  // PROGRESS
  // ===============================
  async updateProgress(
    campaignId: CampaignId,
    index: number,
    recipient: Partial<ICampaignRecipient>
  ): Promise<void> {
    try {
      const update: any = {
        [`recipients.${index}.status`]: recipient.status,
        [`recipients.${index}.attempts`]: recipient.attempts,
        [`recipients.${index}.lastError`]: recipient.lastError,
        [`recipients.${index}.retryAt`]: recipient.retryAt,
        updatedAt: new Date(),
      };

      await CampaignModel.updateOne(
        {
          campaignId: campaignId.value,
          // seguridad extra anti race condition
          [`recipients.${index}.jid`]: recipient.jid,
        },
        { $set: update }
      );
    } catch (error) {
      throw this.translateError(error);
    }
  }

  // ===============================
  // COMPLETE
  // ===============================
  async complete(campaignId: CampaignId): Promise<void> {
    try {
      await CampaignModel.updateOne(
        { campaignId: campaignId.value },
        {
          $set: {
            status: 'completed',
            lockedBy: null,
            lockedAt: null,
            lockExpiresAt: null,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    } catch (error) {
      throw this.translateError(error);
    }
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
      throw this.translateError(error);
    }
  }

  // ===============================
  // MAPPER
  // ===============================
  private toAggregate(document: ICampaignDocument): CampaignAggregate {
    return CampaignAggregate.restore({
      campaignId: CampaignId.fromString(document.campaignId),
      instanceId: InstanceId.fromString(document.instanceId),
      name: CampaignName.create(document.name),
      description: Description.create(document.description),
      status: document.status as CampaignStatus,
      message: Message.create(document.message),
      recipients: document.recipients.map((r) => ({ ...r })),

      lockedAt: document.lockedAt ? LockedAt.create(document.lockedAt) : null,
      lockedBy: document.lockedBy,
      lockExpiresAt: document.lockExpiresAt ? LockExpiresAt.create(document.lockExpiresAt) : null,
      createdAt: CreatedAt.create(document.createdAt),
      updatedAt: UpdatedAt.create(document.updatedAt),
      scheduledAt: document.scheduledAt ? ScheduledAt.create(document.scheduledAt) : undefined,
      startedAt: document.startedAt ? StartedAt.create(document.startedAt) : undefined,
      completedAt: document.completedAt ? CompletedAt.create(document.completedAt) : undefined,
      cronExpression: document.cronExpression ?? undefined,
    });
  }
}
