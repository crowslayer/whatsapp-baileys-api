import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignInitializeEvent } from '@modules/campaign/application/run/event/CampaignInitializeEvent';

describe('CampaignInitializeEvent', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('preserves worker metadata through event serialization', () => {
    // Arrange
    const event = CampaignInitializeEvent.create({
      eventId: 'event-1', aggregateId: 'campaign-1',
      payload: { campaignId: 'campaign-1', instanceId: 'instance-1', workerId: 'worker-1' },
    });

    // Act
    const restored = CampaignInitializeEvent.fromPrimitives(event.toPrimitives());

    // Assert
    expect(restored.eventName).toBe('campaign.initialize');
    expect(restored.payload.workerId).toBe('worker-1');
    expect(Object.isFrozen(restored.payload)).toBe(true);
  });
});
