import type { Request, Response } from 'express';
import { beforeEach, describe, expect, vi } from 'vitest';
import { UpdateFlowController } from '../../../../../src/infrastructure/http/controllers/flows/UpdateFlowController';

describe('UpdateFlowController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: UpdateFlowController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new UpdateFlowController(mockCommandBus);
    req = {
      params: { flowId: 'flow-1' },
      body: { instanceId: 'inst-1', name: 'Updated Flow' },
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

  test('should dispatch UpdateFlowCommand and return 200', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('UpdateFlowCommand');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Update failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should call next with error when body is empty', async () => {
    req.body = {};

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('should call next with error when name is empty string', async () => {
    req.body = { instanceId: 'inst-1', name: '' };

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('should call next with error when instanceId is empty string', async () => {
    req.body = { instanceId: '', name: 'Updated Flow' };

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
