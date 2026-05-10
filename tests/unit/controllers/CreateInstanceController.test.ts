import type { Request, Response } from 'express';
import { AggregateResponse } from '../../../src/application/instances/create/AggregateResponse';
import { CreateInstanceController } from '../../../src/infrastructure/http/controllers/instances/CreateInstanceController';

describe('CreateInstanceController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: CreateInstanceController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn() };
    controller = new CreateInstanceController(mockCommandBus);
    req = {
      body: {
        name: 'My Instance',
        webhookUrl: 'https://example.com/webhook',
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

  test('should dispatch CreateInstanceCommand and return 201', async () => {
    const mockResult = new AggregateResponse();
    mockResult.content = { id: 'inst-1', name: 'My Instance' };
    mockCommandBus.dispatch.mockResolvedValue(mockResult);

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('CreateInstanceCommand');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Creation failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should call next with error when body is empty', async () => {
    req.body = {};
    mockCommandBus.dispatch.mockRejectedValue(new Error('Validation failed'));

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
