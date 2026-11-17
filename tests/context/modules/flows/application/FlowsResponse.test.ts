import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowsResponse } from '@modules/flows/application/FlowsResponse';
import type { Flow } from '@modules/flows/domain/IFlowReadRepository';

describe('FlowsResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps a nonempty list of flows', () => {
    // Arrange
    const flows: Flow[] = [{
      flowId: 'flow-1', instanceId: 'instance-1', name: 'Welcome', version: 1,
      start: 'start', nodes: {}, isActive: true,
    }];

    // Act
    const response = FlowsResponse.create(flows);

    // Assert
    expect(response.content).toBe(flows);
  });

  it('returns no flows for an empty list', () => {
    // Arrange / Act
    const response = FlowsResponse.create([]);

    // Assert
    expect(response.content).toEqual([]);
  });
});
