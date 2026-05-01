import { CampaignAggregate } from '@domain/campaign/CampaignAggregate';
import { ICampaignRepository } from '@domain/campaign/ICampaignRepository';

export class CampaignDispatcher {
  constructor(private readonly repo: ICampaignRepository) {}

  async pick(workerId: string): Promise<CampaignAggregate | null> {
    const now = new Date();

    return await this.repo.findOneAndLock(
      {
        status: 'running',
        // solo campañas con trabajo pendiente
        recipients: {
          $elemMatch: {
            status: 'pending',
            $or: [{ retryAt: null }, { retryAt: { $lte: now } }],
          },
        },

        $or: [{ lockedBy: null }, { lockExpiresAt: { $lt: now } }],
      },
      {
        lockedBy: workerId,
        lockedAt: now,
        lockExpiresAt: new Date(now.getTime() + 60000),
      }
    );
  }
}
