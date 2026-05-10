import type { Request, Response } from 'express';
import { CreateFlowController } from '../../../src/infrastructure/http/controllers/flows/CreateFlowController';

describe('CreateFlowController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: CreateFlowController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new CreateFlowController(mockCommandBus);
    req = {
      body: { instanceId: 'inst-1', name: 'Test Flow' },
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

  test('should dispatch CreateFlowCommand and return 201', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('CreateFlowCommand');
    expect(dispatched.instanceId.value).toBe('inst-1');
    expect(dispatched.name.value).toBe('TEST FLOW');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('DB Error');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should call next with error when body is invalid', async () => {
    req.body = {};
    mockCommandBus.dispatch.mockRejectedValue(new Error('Validation failed'));

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
