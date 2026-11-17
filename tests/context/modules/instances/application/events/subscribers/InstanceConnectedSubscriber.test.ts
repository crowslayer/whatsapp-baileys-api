import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstanceConnectedSubscriber } from '@modules/instances/application/events/subscribers/InstanceConnectedSubscriber';
import { NotifyInstanceConnected } from '@modules/instances/application/connect/NotifyInstanceConnected';
import { InstanceConnectedEvent } from '@modules/instances/domain/events/InstanceConnectedEvent';

describe('InstanceConnectedSubscriber', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('forwards the connected event payload to its use case', async () => {
    // Arrange
    const connected = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as NotifyInstanceConnected;
    const subscriber = new InstanceConnectedSubscriber(connected);
    const event = InstanceConnectedEvent.create({
      eventId: 'event-1', aggregateId: 'instance-1',
      payload: { instanceId: 'instance-1', phoneNumber: '5215555555555', status: 'connected', updatedAt: new Date().toISOString() },
    });

    // Act
    await subscriber.on(event);

    // Assert
    expect(subscriber.subscribedTo()).toEqual([InstanceConnectedEvent]);
    expect(connected.execute).toHaveBeenCalledWith(event.payload);
  });
});
