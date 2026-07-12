import type { Request, Response } from 'express';
import { beforeEach, describe, expect, vi } from 'vitest';
import { FlowsResponse } from '../../../../../src/application/flows/FlowsResponse';
import { ListFlowsController } from '../../../../../src/infrastructure/http/controllers/flows/ListFlowsController';

describe('ListFlowsController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: ListFlowsController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new ListFlowsController(mockQueryBus);
    req = {
      query: { instanceId: 'inst-1' },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: { requestId: 'req-123' },
    } as any;
    next = vi.fn();
  });

  test('should ask query bus and return 200', async () => {
    const mockFlows = [{ flowId: 'flow-1', name: 'Test' }];
    mockQueryBus.ask.mockResolvedValue(FlowsResponse.create(mockFlows));

    await controller.handle(req as Request, res as Response, next);

    expect(mockQueryBus.ask).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should call next with error when query fails', async () => {
    const error = new Error('DB Error');
    mockQueryBus.ask.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should handle missing instanceId', async () => {
    req.query = {};
    mockQueryBus.ask.mockResolvedValue(FlowsResponse.create([]));

    await controller.handle(req as Request, res as Response, next);

    expect(mockQueryBus.ask).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
