import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FlowResponse } from '@modules/flows/application/FlowResponse';
import type { Flow } from '@modules/flows/domain/IFlowReadRepository';

describe('FlowResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps the requested flow', () => {
    // Arrange
    const flow: Flow = {
      flowId: 'flow-1', instanceId: 'instance-1', name: 'Welcome', version: 1,
      start: 'start', nodes: {}, isActive: true,
    };

    // Act
    const response = FlowResponse.create(flow);

    // Assert
    expect(response.content).toBe(flow);
  });

  it('represents a missing flow with null content', () => {
    // Arrange / Act
    const response = FlowResponse.create(null);

    // Assert
    expect(response.content).toBeNull();
  });
});
