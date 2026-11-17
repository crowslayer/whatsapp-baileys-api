import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SummaryFinder } from '@modules/campaign/application/find/summary/SummaryFinder';
import type { ICampaignReadRepository } from '@modules/campaign/domain/ICampaignReadRepository';

describe('SummaryFinder', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns the campaign summary or null when it is missing', async () => {
    // Arrange
    const summary = { campaignId: 'campaign-1', name: 'Launch' };
    const repository = { getSummary: vi.fn().mockResolvedValueOnce(summary).mockResolvedValueOnce(null) } as unknown as ICampaignReadRepository;
    const finder = new SummaryFinder(repository);

    // Act
    const found = await finder.execute('campaign-1');
    const missing = await finder.execute('missing');

    // Assert
    expect(found).toBe(summary);
    expect(missing).toBeNull();
  });
});
