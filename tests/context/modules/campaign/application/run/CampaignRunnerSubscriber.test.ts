import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignRunnerSubscriber } from '@modules/campaign/application/run/CampaignRunnerSubscriber';
import { CampaignInitializeEvent } from '@modules/campaign/application/run/event/CampaignInitializeEvent';
import type { CampaignRunner } from '@modules/campaign/application/run/runner/CampaignRunner';
import type { CampaignRetryer } from '@modules/campaign/application/run/retry/CampaignRetryer';
import type { CampaignScheduler } from '@modules/campaign/infrastructure/schedulers/CampaignScheduler';

describe('CampaignRunnerSubscriber', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('starts both workers and awaits the scheduler for the event worker id', async () => {
    // Arrange
    const runner = { execute: vi.fn() } as unknown as CampaignRunner;
    const retryer = { execute: vi.fn() } as unknown as CampaignRetryer;
    const scheduler = { run: vi.fn().mockResolvedValue(undefined) } as unknown as CampaignScheduler;
    const subscriber = new CampaignRunnerSubscriber(runner, retryer, scheduler);
    const event = CampaignInitializeEvent.create({
      eventId: 'event-1', aggregateId: 'campaign-1',
      payload: { campaignId: 'campaign-1', instanceId: 'instance-1', workerId: 'worker-1' },
    });

    // Act
    await subscriber.on(event);

    // Assert
    expect(subscriber.subscribedTo()).toEqual([CampaignInitializeEvent]);
    expect(runner.execute).toHaveBeenCalledWith('worker-1');
    expect(retryer.execute).toHaveBeenCalledWith('worker-1');
    expect(scheduler.run).toHaveBeenCalledOnce();
  });
});
