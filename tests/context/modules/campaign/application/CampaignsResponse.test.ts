import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignsResponse } from '@modules/campaign/application/CampaignsResponse';
import type { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

describe('CampaignsResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps nonempty campaign results', () => {
    // Arrange
    const campaigns: CampaignReadModel[] = [{
      campaignId: 'campaign-1', instanceId: 'instance-1', name: 'Launch',
      description: 'First campaign', message: 'Hello', status: 'draft',
    }];

    // Act
    const response = CampaignsResponse.create(campaigns);

    // Assert
    expect(response.content).toBe(campaigns);
  });

  it('returns an empty response for an empty list', () => {
    // Arrange / Act
    const response = CampaignsResponse.create([]);

    // Assert
    expect(response.content).toEqual([]);
  });
});
