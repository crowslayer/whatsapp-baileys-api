import type { Request, Response } from 'express';
import { FlowResponse } from '../../../src/application/flows/FlowResponse';
import { GetFlowController } from '../../../src/infrastructure/http/controllers/flows/GetFlowController';

describe('GetFlowController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: GetFlowController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new GetFlowController(mockQueryBus);
    req = {
      params: { flowId: 'flow-1' },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: { requestId: 'req-456' },
    } as any;
    next = vi.fn();
  });

  test('should ask query bus and return 200', async () => {
    const mockFlow = { flowId: 'flow-1', name: 'Test' };
    mockQueryBus.ask.mockResolvedValue(FlowResponse.create(mockFlow));

    await controller.handle(req as Request, res as Response, next);

    expect(mockQueryBus.ask).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should call next with error when query fails', async () => {
    const error = new Error('Not found');
    mockQueryBus.ask.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
