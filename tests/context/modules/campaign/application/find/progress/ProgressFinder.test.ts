import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProgressFinder } from '@modules/campaign/application/find/progress/ProgressFinder';
import type { ICampaignReadRepository } from '@modules/campaign/domain/ICampaignReadRepository';

describe('ProgressFinder', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns campaign progress and defaults falsy progress to zero', async () => {
    // Arrange
    const repository = { getProgress: vi.fn().mockResolvedValueOnce(75).mockResolvedValueOnce(0) } as unknown as ICampaignReadRepository;
    const finder = new ProgressFinder(repository);

    // Act
    const progress = await finder.execute('campaign-1');
    const empty = await finder.execute('campaign-2');

    // Assert
    expect(progress).toBe(75);
    expect(empty).toBe(0);
  });
});
