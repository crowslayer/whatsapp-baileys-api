import { CampaignAggregate, ICampaignRecipient } from '@modules/campaign/domain/CampaignAggregate';
import { CampaignId } from '@modules/campaign/domain/CampaignId';
import { LockedAt } from '@modules/campaign/domain/LockedAt';
import { LockExpiresAt } from '@modules/campaign/domain/LockExpiresAt';

export interface ICampaignRepository {
  findById(campaignId: CampaignId): Promise<CampaignAggregate>;
  save(campaign: CampaignAggregate): Promise<void>;
  startScheduled(now: Date): Promise<CampaignAggregate | null>;
  updateProgress(
    campaignId: CampaignId,
    index: number,
    recipient: Partial<ICampaignRecipient>
  ): Promise<void>;
  findOneAndLock(
    filter: any,
    lockData: {
      lockedBy: string;
      lockedAt: LockedAt;
      lockExpiresAt: LockExpiresAt;
    }
  ): Promise<CampaignAggregate | null>;
  findRetryCandidate(workerId: string): Promise<CampaignAggregate | null>;
  activateNextScheduled(): Promise<CampaignAggregate | null>;
  complete(campaignId: CampaignId): Promise<void>;
  delete(campaignId: CampaignId): Promise<void>;
  lockNext(workerId: string): Promise<CampaignAggregate | null>;
  lockNextRetry(workerId: string): Promise<CampaignAggregate | null>;
  extendLock(campaignId: CampaignId, workerId: string): Promise<void>;
  releaseLock(campaignId: CampaignId, workerId: string): Promise<void>;
}
