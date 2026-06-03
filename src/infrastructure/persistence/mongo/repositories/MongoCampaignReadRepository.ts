import {
  ICampaignItem,
  ICampaignListItem,
  ICampaignReadRepository,
  ICampaignStats,
} from '@domain/campaign/ICampaignReadRepository';

import { CampaignModel } from '@infrastructure/persistence/mongo/models/CampaignModel';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

export class MongoCampaignReadRepository implements ICampaignReadRepository {
  async getById(campaignId: string): Promise<ICampaignItem | null> {
    try {
      const document = await CampaignModel.findOne({ campaignId }).lean<ICampaignItem>().exec();

      return document ?? null;
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to get campaign by id: ${campaignId}`, error);
    }
  }
  // ===============================
  // LIST (dashboard principal)
  // ===============================
  async list(limit: number = 20, skip: number = 0): Promise<ICampaignListItem[]> {
    try {
      return await CampaignModel.aggregate([
        {
          $sort: { createdAt: -1 },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            campaignId: 1,
            name: 1,
            status: 1,
            scheduledAt: 1,
            startedAt: 1,
            completedAt: 1,
            createdAt: 1,
            total: { $size: '$recipients' },

            sent: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'r',
                  cond: { $eq: ['$$r.status', 'sent'] },
                },
              },
            },

            failed: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'r',
                  cond: { $eq: ['$$r.status', 'failed'] },
                },
              },
            },

            pending: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'r',
                  cond: { $eq: ['$$r.status', 'pending'] },
                },
              },
            },
          },
        },
      ]);
    } catch (error: unknown) {
      throw new InfrastructureError(`Failed to list campaigns`, error);
    }
  }
  // ===============================
  // SINGLE CAMPAIGN SUMMARY
  // ===============================
  async getSummary(campaignId: string): Promise<ICampaignListItem | null> {
    try {
      const result = await CampaignModel.aggregate([
        {
          $match: { campaignId },
        },
        {
          $limit: 1,
        },
        {
          $project: {
            campaignId: 1,
            name: 1,
            status: 1,
            scheduledAt: 1,
            startedAt: 1,
            completedAt: 1,
            createdAt: 1,
            total: { $size: '$recipients' },

            sent: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'r',
                  cond: { $eq: ['$$r.status', 'sent'] },
                },
              },
            },

            failed: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'r',
                  cond: { $eq: ['$$r.status', 'failed'] },
                },
              },
            },

            pending: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'r',
                  cond: { $eq: ['$$r.status', 'pending'] },
                },
              },
            },
          },
        },
      ]);

      return result[0] ?? null;
    } catch (error) {
      throw new InfrastructureError(`Failed retrieve campaign summary`, error);
    }
  }

  // ===============================
  // GLOBAL STATS
  // ===============================
  async getStats(): Promise<ICampaignStats> {
    try {
      const result = await CampaignModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },

            running: {
              $sum: {
                $cond: [{ $eq: ['$status', 'running'] }, 1, 0],
              },
            },

            scheduled: {
              $sum: {
                $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0],
              },
            },

            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },

            paused: {
              $sum: {
                $cond: [{ $eq: ['$status', 'paused'] }, 1, 0],
              },
            },
          },
        },
      ]);

      return (
        result[0] || {
          total: 0,
          running: 0,
          scheduled: 0,
          completed: 0,
          paused: 0,
        }
      );
    } catch (error) {
      throw new InfrastructureError(`Failed to get stats for campaigns`, error);
    }
  }

  // ===============================
  // PROGRESS (%) rápido
  // ===============================
  async getProgress(campaignId: string): Promise<number> {
    try {
      const doc = await CampaignModel.aggregate([
        { $match: { campaignId } },
        {
          $project: {
            total: { $size: '$recipients' },
            sent: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'r',
                  cond: { $eq: ['$$r.status', 'sent'] },
                },
              },
            },
          },
        },
      ]);

      if (!doc[0] || doc[0].total === 0) return 0;

      return Math.round((doc[0].sent / doc[0].total) * 100);
    } catch (error) {
      throw new InfrastructureError(`Failed to get campaign progress`, error);
    }
  }
}
