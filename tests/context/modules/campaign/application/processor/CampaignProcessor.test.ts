import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:timers/promises', () => ({ setTimeout: vi.fn().mockRejectedValue(new Error('stop worker')) }));

import { CampaignProcessor } from '@modules/campaign/application/processor/CampaignProcessor';
import type { CampaignDispatcher } from '@modules/campaign/infrastructure/dispatchers/CampaignDispatcher';
import type { ICampaignRepository } from '@modules/campaign/domain/ICampaignRepository';
import type { InstanceRateLimiterFactory } from '@modules/campaign/application/processor/InstanceRateLimiterFactory';
import type { MessageOrchestrator } from '@shared/application/services/MessageOrchestrator';
import type { IConnectionEventBus } from '@modules/instances/domain/IConnectionEventBus';
import type { ILogger } from '@shared/domain/Logger';

describe('CampaignProcessor', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('waits for the next campaign when the dispatcher has no work', async () => {
    // Arrange
    const dispatcher = { pick: vi.fn().mockResolvedValue(null) } as unknown as CampaignDispatcher;
    const logger = { info: vi.fn(), error: vi.fn() } as unknown as ILogger;
    const processor = new CampaignProcessor({} as ICampaignRepository, {} as MessageOrchestrator, {} as InstanceRateLimiterFactory, dispatcher, { emit: vi.fn() } as unknown as IConnectionEventBus, logger);

    // Act & Assert
    await expect(processor.run('worker-1')).rejects.toThrow('stop worker');
    expect(dispatcher.pick).toHaveBeenCalledWith('worker-1');
    expect(logger.info).toHaveBeenCalledWith({ event: 'WORKER.START', workerId: 'worker-1' });
  });
});
