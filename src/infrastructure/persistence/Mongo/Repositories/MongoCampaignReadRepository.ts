import {
  ICampaignListItem,
  ICampaignReadRepository,
  ICampaignStats,
} from '@domain/campaign/ICampaignReadRepository';

import { CampaignModel } from '@infrastructure/persistence/mongo/models/CampaignModel';

export class MongoCampaignReadRepository implements ICampaignReadRepository {
  // ===============================
  // LIST (dashboard principal)
  // ===============================
  async list(limit: number = 20, skip: number = 0): Promise<ICampaignListItem[]> {
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
  }

  // ===============================
  // SINGLE CAMPAIGN SUMMARY
  // ===============================
  async getSummary(campaignId: string): Promise<ICampaignListItem | null> {
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
  }

  // ===============================
  // GLOBAL STATS
  // ===============================
  async getStats(): Promise<ICampaignStats> {
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
  }

  // ===============================
  // PROGRESS (%) rápido
  // ===============================
  async getProgress(campaignId: string): Promise<number> {
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
  }
}
