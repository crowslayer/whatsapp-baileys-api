import type { Request, Response } from 'express';
import { ConnectInstanceController } from '../../../src/infrastructure/http/controllers/instances/ConnectInstanceController';

describe('ConnectInstanceController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: ConnectInstanceController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn() };
    controller = new ConnectInstanceController(mockCommandBus);
    req = {
      body: {
        instanceId: 'inst-1',
        usePairingCode: true,
        phoneNumber: '521234567890',
      },
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

  test('should dispatch ConnectInstanceCommand and return 201', async () => {
    mockCommandBus.dispatch.mockResolvedValue({ qrCode: 'qr-data' });

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('ConnectInstanceCommand');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Connection failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should handle connection without pairing code', async () => {
    req.body = { instanceId: 'inst-1' };
    mockCommandBus.dispatch.mockResolvedValue({ qrCode: 'qr-data' });

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
