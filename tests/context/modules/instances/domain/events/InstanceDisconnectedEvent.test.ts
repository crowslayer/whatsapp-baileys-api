import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstanceDisconnectedEvent } from '@modules/instances/domain/events/InstanceDisconnectedEvent';

describe('InstanceDisconnectedEvent', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('retains the disconnection reason when restored from primitives', () => {
    // Arrange
    const input = {
      eventId: 'event-disconnected',
      aggregateId: 'instance-1',
      payload: { instanceId: 'instance-1', name: 'Main', reason: 'connection closed' },
    };

    // Act
    const event = InstanceDisconnectedEvent.create(input);
    const restored = InstanceDisconnectedEvent.fromPrimitives(event.toPrimitives());

    // Assert
    expect(restored.eventName).toBe('instance.disconnected');
    expect(restored.payload.reason).toBe('connection closed');
    expect(restored.payload.name).toBe('Main');
  });
});
