import type { Request, Response } from 'express';
import { InstanceResponse } from '../../../src/application/instances/InstanceResponse';
import { GetInstanceController } from '../../../src/infrastructure/http/controllers/instances/GetInstanceController';

describe('GetInstanceController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: GetInstanceController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new GetInstanceController(mockQueryBus);
    req = {
      params: { instanceId: 'inst-1' },
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
    mockQueryBus.ask.mockResolvedValue(InstanceResponse.create({ id: 'inst-1', name: 'Test' }));

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
