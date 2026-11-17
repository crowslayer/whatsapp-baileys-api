import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn().mockRejectedValue(new Error('stop scheduler')) }));

import { CampaignScheduler } from '@modules/campaign/infrastructure/schedulers/CampaignScheduler';
import type { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';
import type { ILogger } from '@shared/domain/Logger';

describe('CampaignScheduler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('activates due campaigns and reports the activated count', async () => {
    // Arrange
    const repository = { activateNextScheduled: vi.fn().mockResolvedValueOnce({}).mockResolvedValueOnce(null) } as unknown as ICampaignRepository;
    const logger = { info: vi.fn() } as unknown as ILogger;
    const scheduler = new CampaignScheduler(repository, logger);

    // Act & Assert
    await expect(scheduler.run()).rejects.toThrow('stop scheduler');
    expect(repository.activateNextScheduled).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledWith('[Scheduler] Activated 1 campaigns');
  });
});
