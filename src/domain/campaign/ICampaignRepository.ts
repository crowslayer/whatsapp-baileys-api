import { CampaignAggregate, ICampaignRecipient } from '@domain/campaign/CampaignAggregate';
import { CampaignId } from '@domain/campaign/CampaignId';

export interface ICampaignRepository {
  findById(campaignId: CampaignId): Promise<CampaignAggregate>;
  save(campaign: CampaignAggregate): Promise<void>;
  startScheduled(now: Date): Promise<CampaignAggregate | null>;
  updateProgress(
    campaignId: CampaignId,
    index: number,
    recipient: Partial<ICampaignRecipient>
  ): Promise<void>;
  complete(campaignId: CampaignId): Promise<void>;
  delete(campaignId: CampaignId): Promise<void>;
  lockNext(workerId: string): Promise<CampaignAggregate | null>;
  extendLock(campaignId: CampaignId, workerId: string): Promise<void>;
  releaseLock(campaignId: CampaignId, workerId: string): Promise<void>;
}
