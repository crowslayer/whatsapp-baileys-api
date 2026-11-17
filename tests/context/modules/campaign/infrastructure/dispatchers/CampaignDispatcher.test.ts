import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignDispatcher } from '@modules/campaign/infrastructure/dispatchers/CampaignDispatcher';
import type { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';

describe('CampaignDispatcher', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('locks the next runnable campaign for the worker', async () => {
    // Arrange
    const campaign = { campaignId: 'campaign-1' };
    const repository = { findOneAndLock: vi.fn().mockResolvedValue(campaign) } as unknown as ICampaignRepository;

    // Act
    const result = await new CampaignDispatcher(repository).pick('worker-1');

    // Assert
    expect(result).toBe(campaign);
    const [filter, lockData] = vi.mocked(repository.findOneAndLock).mock.calls[0] ?? [];
    expect(filter).toEqual(expect.objectContaining({ status: 'running' }));
    expect(lockData).toEqual(expect.objectContaining({ lockedBy: 'worker-1' }));
    expect(lockData?.lockExpiresAt).toBeDefined();
  });

  it('returns null if no campaign could be locked', async () => {
    // Arrange
    const repository = { findOneAndLock: vi.fn().mockResolvedValue(null) } as unknown as ICampaignRepository;

    // Act
    const result = await new CampaignDispatcher(repository).pick('worker-1');

    // Assert
    expect(result).toBeNull();
  });
});
