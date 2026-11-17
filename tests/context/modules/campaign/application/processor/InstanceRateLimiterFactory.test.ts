import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstanceRateLimiterFactory } from '@modules/campaign/application/processor/InstanceRateLimiterFactory';

describe('InstanceRateLimiterFactory', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('reuses a limiter for the same instance and isolates other instances', () => {
    // Arrange
    const factory = new InstanceRateLimiterFactory();

    // Act
    const first = factory.get('instance-1');
    const again = factory.get('instance-1');
    const other = factory.get('instance-2');

    // Assert
    expect(again).toBe(first);
    expect(other).not.toBe(first);
  });
});
