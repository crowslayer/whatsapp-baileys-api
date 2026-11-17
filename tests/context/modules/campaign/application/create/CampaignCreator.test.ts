import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignCreator } from '@modules/campaign/application/create/CampaignCreator';
import { CampaignAggregate } from '@modules/campaign/domain/CampaignAggregate';
import type { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';

describe('CampaignCreator', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates and saves a campaign with pending recipients', async () => {
    // Arrange
    const repository = { save: vi.fn().mockResolvedValue(undefined) } as unknown as ICampaignRepository;
    const creator = new CampaignCreator(repository);

    // Act
    await creator.execute({
      instanceId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', name: 'Launch',
      description: 'First campaign', message: 'Hello', numbers: ['123@s.whatsapp.net'],
    });

    // Assert
    expect(repository.save).toHaveBeenCalledOnce();
    const aggregate = vi.mocked(repository.save).mock.calls[0]?.[0];
    expect(aggregate).toBeInstanceOf(CampaignAggregate);
    expect(aggregate?.recipients).toEqual([{ jid: '123@s.whatsapp.net', status: 'pending', attempts: 0 }]);
  });
});
