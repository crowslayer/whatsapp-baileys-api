import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FindInstance } from '@modules/instances/application/get/FindInstance';
import type { IInstanceReadRepository } from '@modules/instances/domain/IInstanceReadRepository';

describe('FindInstance', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns the instance found by id, or null when absent', async () => {
    // Arrange
    const instance = { instanceId: 'instance-1', name: 'Support' };
    const repository = { findById: vi.fn().mockResolvedValueOnce(instance).mockResolvedValueOnce(undefined) } as unknown as IInstanceReadRepository;
    const finder = new FindInstance(repository);

    // Act
    const found = await finder.execute('instance-1');
    const missing = await finder.execute('unknown');

    // Assert
    expect(found).toBe(instance);
    expect(missing).toBeNull();
  });
});
