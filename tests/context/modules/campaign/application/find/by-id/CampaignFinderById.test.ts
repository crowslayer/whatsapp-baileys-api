import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignFinderById } from '@modules/campaign/application/find/by-id/CampaignFinderById';
import type { ICampaignReadRepository } from '@modules/campaign/domain/ICampaignReadRepository';

describe('CampaignFinderById', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns the found campaign or null', async () => {
    // Arrange
    const campaign = { campaignId: 'campaign-1' };
    const repository = { getById: vi.fn().mockResolvedValueOnce(campaign).mockResolvedValueOnce(undefined) } as unknown as ICampaignReadRepository;
    const finder = new CampaignFinderById(repository);

    // Act
    const found = await finder.execute('campaign-1');
    const missing = await finder.execute('missing');

    // Assert
    expect(found).toBe(campaign);
    expect(missing).toBeNull();
  });
});
