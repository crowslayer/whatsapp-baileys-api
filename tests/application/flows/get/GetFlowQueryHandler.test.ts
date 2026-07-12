import { describe, expect, vi } from 'vitest';
import { FlowResponse } from '../../../../src/application/flows/FlowResponse';
import { GetFlowQuery } from '../../../../src/application/flows/get/GetFlowQuery';
import { GetFlowQueryHandler } from '../../../../src/application/flows/get/GetFlowQueryHandler';
import type { Flow } from '../../../../src/domain/queries/IFlowReadRepository';

describe('GetFlowQueryHandler', () => {
  test('should return FlowResponse from finder', async () => {
    const mockFlow: Flow = {
      flowId: 'f1',
      instanceId: 'i1',
      name: 'F1',
      version: 1,
      start: 's',
      nodes: {},
      isActive: true,
    };
    const mockFinder = { execute: vi.fn().mockResolvedValue(mockFlow) };
    const handler = new GetFlowQueryHandler(mockFinder);
    const query = new GetFlowQuery('f1');

    const result = await handler.handle(query);
    expect(result).toBeInstanceOf(FlowResponse);
    expect(result.content).toEqual(mockFlow);
    expect(mockFinder.execute).toHaveBeenCalledWith('f1');
  });

  test('subscribedTo returns GetFlowQuery', () => {
    const handler = new GetFlowQueryHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(GetFlowQuery);
  });
});
