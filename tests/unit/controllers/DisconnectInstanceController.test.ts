import type { Request, Response } from 'express';
import { DisconnectInstanceController } from '../../../src/infrastructure/http/controllers/instances/DisconnectInstanceController';

describe('DisconnectInstanceController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: DisconnectInstanceController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new DisconnectInstanceController(mockCommandBus);
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

  test('should dispatch DisconnectInstanceCommand and return 200', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('DisconnectInstanceCommand');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Disconnect failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
