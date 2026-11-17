import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GetFlowQueryHandler } from '@modules/flows/application/get/GetFlowQueryHandler';
import { GetFlowQuery } from '@modules/flows/application/get/GetFlowQuery';
import { FlowResponse } from '@modules/flows/application/FlowResponse';
import type { GetFlow } from '@modules/flows/application/get/GetFlow';

describe('GetFlowQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('loads a flow and wraps it in a response', async () => {
    // Arrange
    const flow = { flowId: 'flow-1' };
    const useCase = { execute: vi.fn().mockResolvedValue(flow) } as unknown as GetFlow;
    const handler = new GetFlowQueryHandler(useCase);
    const query = new GetFlowQuery('flow-1');

    // Act
    const response = await handler.handle(query);

    // Assert
    expect(handler.subscribedTo()).toBe(GetFlowQuery);
    expect(useCase.execute).toHaveBeenCalledWith('flow-1');
    expect(response).toBeInstanceOf(FlowResponse);
    expect(response.content).toBe(flow);
  });
});
