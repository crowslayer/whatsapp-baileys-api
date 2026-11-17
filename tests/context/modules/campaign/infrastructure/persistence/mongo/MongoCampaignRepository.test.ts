import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoCampaignRepository } from '@modules/campaign/infrastructure/persistence/mongo/MongoCampaignRepository';
import { CampaignModel } from '@modules/campaign/infrastructure/persistence/mongo/CampaignModel';
import { CampaignId } from '@modules/campaign/domain/CampaignId';

describe('MongoCampaignRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('releases a campaign lock for its owning worker', async () => {
    // Arrange
    const updateOne = vi.spyOn(CampaignModel, 'updateOne').mockResolvedValue({ modifiedCount: 1 } as never);
    const repository = new MongoCampaignRepository();
    const campaignId = CampaignId.fromString('9c858901-8a57-4791-81fe-4c455b099bc9');

    // Act
    await repository.releaseLock(campaignId, 'worker-1');

    // Assert
    expect(updateOne).toHaveBeenCalledWith(
      { campaignId: campaignId.value, lockedBy: 'worker-1' },
      { $set: { lockedBy: null, lockedAt: null, lockExpiresAt: null } }
    );
  });
});
