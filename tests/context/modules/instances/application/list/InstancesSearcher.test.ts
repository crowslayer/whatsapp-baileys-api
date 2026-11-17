import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstancesSearcher } from '@modules/instances/application/list/InstancesSearcher';
import type { IInstanceReadRepository } from '@modules/instances/domain/IInstanceReadRepository';

describe('InstancesSearcher', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns every instance and normalizes an empty result', async () => {
    // Arrange
    const repository = { findAll: vi.fn().mockResolvedValueOnce([{ instanceId: 'i1' }]).mockResolvedValueOnce(undefined) } as unknown as IInstanceReadRepository;
    const searcher = new InstancesSearcher(repository);

    // Act
    const found = await searcher.execute();
    const empty = await searcher.execute();

    // Assert
    expect(found).toHaveLength(1);
    expect(empty).toEqual([]);
  });
});
