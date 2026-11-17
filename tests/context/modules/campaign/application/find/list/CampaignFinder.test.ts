import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignFinder } from '@modules/campaign/application/find/list/CampaignFinder';
import type { ICampaignReadRepository } from '@modules/campaign/domain/ICampaignReadRepository';

describe('CampaignFinder', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('uses default pagination values and returns repository results', async () => {
    // Arrange
    const campaigns = [{ campaignId: 'campaign-1' }];
    const repository = { list: vi.fn().mockResolvedValue(campaigns) } as unknown as ICampaignReadRepository;

    // Act
    const result = await new CampaignFinder(repository).execute();

    // Assert
    expect(repository.list).toHaveBeenCalledWith(20, 0);
    expect(result).toBe(campaigns);
  });

  it('returns an empty list when the repository result is nullish', async () => {
    // Arrange
    const repository = { list: vi.fn().mockResolvedValue(null) } as unknown as ICampaignReadRepository;

    // Act
    const result = await new CampaignFinder(repository).execute(5, 10);

    // Assert
    expect(repository.list).toHaveBeenCalledWith(5, 10);
    expect(result).toEqual([]);
  });
});
