import type { Request, Response } from 'express';
import { beforeEach, describe, expect, vi } from 'vitest';
import { CreateCampaignController } from '../../../../../src/infrastructure/http/controllers/campaign/CreateCampaignController';

describe('CreateCampaignController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: CreateCampaignController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new CreateCampaignController(mockCommandBus);
    req = {
      body: {
        instanceId: 'inst-1',
        name: 'Campaign 1',
        description: 'A test campaign',
        message: 'Hello {{name}}',
        numbers: ['521234567890', '521098765432', 'invalid-phone'],
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

  test('should dispatch CreateCampaignCommand and return 201', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('CreateCampaignCommand');
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

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('should handle all numbers invalid', async () => {
    req.body = {
      instanceId: 'inst-1',
      name: 'Campaign 1',
      description: 'Test',
      message: 'Hello',
      numbers: ['not-a-number', 'also-invalid'],
    };
    mockCommandBus.dispatch.mockResolvedValue(undefined);

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
