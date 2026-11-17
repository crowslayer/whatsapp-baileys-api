import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GetInstanceQueryHandler } from '@modules/instances/application/get/GetInstanceQueryHandler';
import { GetInstanceQuery } from '@modules/instances/application/get/GetInstanceQuery';
import { FindInstance } from '@modules/instances/application/get/FindInstance';

describe('GetInstanceQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns a response for a found instance and raises not found otherwise', async () => {
    // Arrange
    const instance = { id: 'instance-1', name: 'Support' };
    const useCase = { execute: vi.fn().mockResolvedValueOnce(instance).mockResolvedValueOnce(null) } as unknown as FindInstance;
    const handler = new GetInstanceQueryHandler(useCase);

    // Act
    const found = await handler.handle(new GetInstanceQuery('instance-1'));

    // Assert
    expect(found.content).toEqual(instance);
    await expect(handler.handle(new GetInstanceQuery('missing'))).rejects.toThrow('Instance not found');
  });
});
