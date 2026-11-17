import { CampaignAggregate } from '@modules/campaign/domain/CampaignAggregate';
import { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';
import { LockedAt } from '@modules/campaign/domain/LockedAt';
import { LockExpiresAt } from '@modules/campaign/domain/LockExpiresAt';

export class CampaignDispatcher {
  constructor(private readonly repository: ICampaignRepository) {}

  async pick(workerId: string): Promise<CampaignAggregate | null> {
    const now = new Date();
    const filter = {
      status: 'running',
      // solo campañas con trabajo pendiente
      recipients: {
        $elemMatch: {
          status: 'pending',
          $or: [{ retryAt: null }, { retryAt: { $lte: now } }],
        },
      },

      $or: [{ lockedBy: null }, { lockExpiresAt: { $lt: now } }],
    };
    const campaign = await this.repository.findOneAndLock(filter, {
      lockedBy: workerId,
      lockedAt: LockedAt.create(now),
      lockExpiresAt: LockExpiresAt.create(new Date(now.getTime() + 60000)),
    });

    return campaign ?? null;
  }
}
