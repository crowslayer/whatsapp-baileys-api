import type { Request, Response } from 'express';
import { InstancesResponse } from '../../../../../src/application/instances/InstancesResponse';
import { GetInstancesController } from '../../../../../src/infrastructure/http/controllers/instances/GetInstancesController';

describe('GetInstancesController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: GetInstancesController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new GetInstancesController(mockQueryBus);
    req = {
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
    mockQueryBus.ask.mockResolvedValue(InstancesResponse.create([{ id: 'inst-1', name: 'Test' }]));

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

  test('should handle empty list', async () => {
    mockQueryBus.ask.mockResolvedValue(InstancesResponse.create([]));

    await controller.handle(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
