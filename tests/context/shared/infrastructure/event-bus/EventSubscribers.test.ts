import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EventSubscribers } from '@shared/infrastructure/event-bus/EventSubscribers';
import type { IEventSubscriber } from '@shared/domain/event/IEventSubscriber';
import type { AnyEvent } from '@shared/domain/event/Event';

describe('EventSubscribers', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('loads all tagged subscribers from the dependency container', () => {
    // Arrange
    const subscriber = { subscribedTo: vi.fn(() => []), on: vi.fn() } as unknown as IEventSubscriber<AnyEvent>;
    const container = {
      findTaggedServiceIds: vi.fn().mockReturnValue({ first: [], second: [] }),
      get: vi.fn().mockReturnValueOnce(subscriber).mockReturnValueOnce(subscriber),
    };

    // Act
    const result = EventSubscribers.from(container as never);

    // Assert
    expect(container.findTaggedServiceIds).toHaveBeenCalledWith('subscriber');
    expect(container.get).toHaveBeenCalledTimes(2);
    expect(result.items).toEqual([subscriber, subscriber]);
  });

  it('returns an empty subscriber list when no services are tagged', () => {
    // Arrange
    const container = {
      findTaggedServiceIds: vi.fn().mockReturnValue({}),
      get: vi.fn(),
    };

    // Act
    const result = EventSubscribers.from(container as never);

    // Assert
    expect(result.items).toEqual([]);
    expect(container.get).not.toHaveBeenCalled();
  });
});
