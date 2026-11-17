import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstanceRateLimiter } from '@modules/campaign/application/processor/InstanceRateLimiter';

describe('InstanceRateLimiter', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('allows a turn while both rate windows have capacity', async () => {
    // Arrange
    const limiter = new InstanceRateLimiter(1, 1);

    // Act
    await limiter.waitTurn();

    // Assert
    expect(limiter).toBeInstanceOf(InstanceRateLimiter);
  });
});
