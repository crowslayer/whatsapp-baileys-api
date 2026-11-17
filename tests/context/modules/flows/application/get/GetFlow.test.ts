import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GetFlow } from '@modules/flows/application/get/GetFlow';
import type { IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';

describe('GetFlow', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns the flow found by its identifier', async () => {
    // Arrange
    const flow = { flowId: 'flow-1' };
    const repository = { findById: vi.fn().mockResolvedValue(flow) } as unknown as IFlowReadRepository;

    // Act
    const result = await new GetFlow(repository).execute('flow-1');

    // Assert
    expect(repository.findById).toHaveBeenCalledWith('flow-1');
    expect(result).toBe(flow);
  });
});
