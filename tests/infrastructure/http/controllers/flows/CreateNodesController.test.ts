import type { Request, Response } from 'express';
import { beforeEach, describe, expect, vi } from 'vitest';
import { CreateNodesController } from '../../../../../src/infrastructure/http/controllers/flows/CreateNodesController';

describe('CreateNodesController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: CreateNodesController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new CreateNodesController(mockCommandBus);
    req = {
      body: {
        flowId: 'flow-1',
        nodes: [{ id: 'node-1', type: 'message', config: {} }],
        start: 'node-1',
        triggers: ['hello'],
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

  test('should dispatch CreateNodesCommand and return 201', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('CreateNodesCommand');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Creation failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should handle missing triggers', async () => {
    req.body = { flowId: 'flow-1', nodes: [], start: 'node-1' };

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('should call next with error when flowId is empty', async () => {
    req.body = { flowId: '', nodes: [], start: 'node-1' };

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('should call next with error when body is empty', async () => {
    req.body = {};

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
