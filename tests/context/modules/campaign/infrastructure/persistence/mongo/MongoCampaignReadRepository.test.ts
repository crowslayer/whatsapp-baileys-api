import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoCampaignReadRepository } from '@modules/campaign/infrastructure/persistence/mongo/MongoCampaignReadRepository';
import { CampaignModel } from '@modules/campaign/infrastructure/persistence/mongo/CampaignModel';

describe('MongoCampaignReadRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('calculates rounded progress from aggregate counts', async () => {
    // Arrange
    vi.spyOn(CampaignModel, 'aggregate').mockResolvedValue([{ total: 3, sent: 2 }] as never);
    const repository = new MongoCampaignReadRepository();

    // Act
    const progress = await repository.getProgress('campaign-1');

    // Assert
    expect(progress).toBe(67);
  });

  it('returns zero progress when there are no recipients', async () => {
    // Arrange
    vi.spyOn(CampaignModel, 'aggregate').mockResolvedValue([{ total: 0, sent: 0 }] as never);
    const repository = new MongoCampaignReadRepository();

    // Act
    const progress = await repository.getProgress('campaign-empty');

    // Assert
    expect(progress).toBe(0);
  });
});
