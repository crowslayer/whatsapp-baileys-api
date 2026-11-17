import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StatsFinder } from '@modules/campaign/application/find/stats/StatsFinder';
import type { ICampaignReadRepository } from '@modules/campaign/domain/ICampaignReadRepository';

describe('StatsFinder', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns statistics supplied by the repository', async () => {
    // Arrange
    const stats = { total: 4, running: 1, scheduled: 1, completed: 2, paused: 0 };
    const repository = { getStats: vi.fn().mockResolvedValue(stats) } as unknown as ICampaignReadRepository;

    // Act
    const result = await new StatsFinder(repository).execute();

    // Assert
    expect(result).toBe(stats);
    expect(repository.getStats).toHaveBeenCalledOnce();
  });
});
