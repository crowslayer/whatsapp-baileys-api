import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LimiterFactory } from '@modules/campaign/application/LimiterFactory';

describe('LimiterFactory', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('reuses a limiter per instance and creates separate limiters for other instances', () => {
    // Arrange
    const factory = new LimiterFactory();

    // Act
    const first = factory.getLimiter('instance-1');
    const sameInstance = factory.getLimiter('instance-1');
    const otherInstance = factory.getLimiter('instance-2');

    // Assert
    expect(sameInstance).toBe(first);
    expect(otherInstance).not.toBe(first);
  });
});
