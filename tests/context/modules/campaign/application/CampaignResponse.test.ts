import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';

describe('CampaignResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps the supplied content without changing it', () => {
    // Arrange
    const content = { campaignId: 'campaign-1', success: 4 };

    // Act
    const response = CampaignResponse.create(content);

    // Assert
    expect(response.content).toBe(content);
  });
});
