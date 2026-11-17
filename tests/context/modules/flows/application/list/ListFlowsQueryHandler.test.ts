import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ListFlowsQueryHandler } from '@modules/flows/application/list/ListFlowsQueryHandler';
import { ListFlowsQuery } from '@modules/flows/application/list/ListFlowsQuery';
import { FlowsResponse } from '@modules/flows/application/FlowsResponse';
import type { ListFlows } from '@modules/flows/application/list/ListFlows';

describe('ListFlowsQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('queries an instance and wraps the returned flows', async () => {
    // Arrange
    const flows = [{ flowId: 'flow-1' }];
    const useCase = { execute: vi.fn().mockResolvedValue(flows) } as unknown as ListFlows;
    const handler = new ListFlowsQueryHandler(useCase);
    const query = new ListFlowsQuery('instance-1');

    // Act
    const response = await handler.handle(query);

    // Assert
    expect(handler.subscribedTo()).toBe(ListFlowsQuery);
    expect(useCase.execute).toHaveBeenCalledWith('instance-1');
    expect(response).toBeInstanceOf(FlowsResponse);
    expect(response.content).toBe(flows);
  });
});
