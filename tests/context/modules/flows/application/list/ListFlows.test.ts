import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ListFlows } from '@modules/flows/application/list/ListFlows';
import type { IFlowReadRepository } from '@modules/flows/domain/IFlowReadRepository';

describe('ListFlows', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('lists flows for the requested instance', async () => {
    // Arrange
    const flows = [{ flowId: 'flow-1' }];
    const repository = { findByInstance: vi.fn().mockResolvedValue(flows) } as unknown as IFlowReadRepository;

    // Act
    const result = await new ListFlows(repository).execute('instance-1');

    // Assert
    expect(repository.findByInstance).toHaveBeenCalledWith('instance-1');
    expect(result).toBe(flows);
  });
});
