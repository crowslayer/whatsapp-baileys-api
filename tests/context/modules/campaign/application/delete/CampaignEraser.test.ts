import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignEraser } from '@modules/campaign/application/delete/CampaignEraser';
import type { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';

describe('CampaignEraser', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('deletes the campaign using its value object id', async () => {
    // Arrange
    const repository = { delete: vi.fn().mockResolvedValue(undefined) } as unknown as ICampaignRepository;

    // Act
    await new CampaignEraser(repository).execute('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f');

    // Assert
    expect(repository.delete).toHaveBeenCalledWith(expect.objectContaining({ value: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f' }));
  });
});
