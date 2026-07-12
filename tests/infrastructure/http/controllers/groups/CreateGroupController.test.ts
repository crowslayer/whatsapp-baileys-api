import type { Request, Response } from 'express';
import { beforeEach, describe, expect, vi } from 'vitest';
import { CreateGroupController } from '../../../../../src/infrastructure/http/controllers/groups/CreateGroupController';

describe('CreateGroupController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: CreateGroupController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn() };
    controller = new CreateGroupController(mockCommandBus);
    req = {
      params: { instanceId: 'inst-1' },
      body: { name: 'Test Group', participants: ['521234567890@s.whatsapp.net'] },
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

  test('should dispatch CreateGroupCommand and return 201', async () => {
    mockCommandBus.dispatch.mockResolvedValue('group-abc123');

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('CreateGroupCommand');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Creation failed');
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
