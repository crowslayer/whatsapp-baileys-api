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
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

// type LeanCampaign = Pick<ICampaignDocument, 'recipients'>;

export class MongoCampaignRepository implements ICampaignRepository {
  async findById(campaignId: CampaignId): Promise<CampaignAggregate> {
    try {
      const document = await CampaignModel.findOne({ campaignId: campaignId.value });

      if (!document) {
        throw new NotFoundError('Campaign not exist');
      }

      return this.toDomain(document);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InfrastructureError(`Failed to get campaign by id: ${campaignId.value}`, error);
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

      return model ? this.toDomain(model) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed Campaign, lock next`, error);
    }
  }

  async findOneAndLock(
    filter: any,
    lockData: {
      lockedBy: string;
      lockedAt: Date;
      lockExpiresAt: Date;
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

      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed to find Campaign `, error);
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

      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed to retry candidate`, error);
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

      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed to active Campaign`, error);
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

      return document ? this.toDomain(document) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed to next retry`, error);
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
      throw new InfrastructureError(`Failed to extend lock `, error);
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
      throw new InfrastructureError(`Failed to release lock`, error);
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

      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw new InfrastructureError(`Failed to start schedule`, error);
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
      throw new InfrastructureError(`Failed to update progress`, error);
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
      throw new InfrastructureError(`Failed to complete campaign`, error);
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
      recipients: document.recipients.map((r) => ({ ...r })),

      lockedAt: document.lockedAt,
      lockedBy: document.lockedBy,
      lockExpiresAt: document.lockExpiresAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      scheduledAt: document.scheduledAt ?? undefined,
      startedAt: document.startedAt ?? undefined,
      completedAt: document.completedAt ?? undefined,
      cronExpression: document.cronExpression ?? undefined,
    });
  }
}
