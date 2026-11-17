import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignUpdater } from '@modules/campaign/application/update/CampaignUpdater';
import type { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';

describe('CampaignUpdater', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('loads and updates the campaign aggregate with replacement recipients', async () => {
    // Arrange
    const aggregate = { updated: vi.fn() };
    const repository = { findById: vi.fn().mockResolvedValue(aggregate) } as unknown as ICampaignRepository;

    // Act
    await new CampaignUpdater(repository).execute({
      campaignId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e1f',
      instanceId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f',
      name: 'Launch', description: 'Updated', message: 'Hello again', numbers: ['jid-1', 'jid-2'],
    });

    // Assert
    expect(aggregate.updated).toHaveBeenCalledWith(expect.objectContaining({
      instanceId: expect.objectContaining({ value: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f' }),
      recipients: [
        { jid: 'jid-1', status: 'pending', attempts: 0 },
        { jid: 'jid-2', status: 'pending', attempts: 0 },
      ],
    }));
  });
});
