import type { Request, Response } from 'express';
import { beforeEach, describe, expect, vi } from 'vitest';
import { UpdateCampaignController } from '../../../../../src/infrastructure/http/controllers/campaign/UpdateCampaignController';

describe('UpdateCampaignController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: UpdateCampaignController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new UpdateCampaignController(mockCommandBus);
    req = {
      params: { id: 'camp-1' },
      body: {
        instanceId: 'inst-1',
        name: 'Updated Campaign',
        description: 'Updated description',
        message: 'Hi {{name}}',
        numbers: ['521234567890'],
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

  test('should dispatch UpdateCampaignCommand and return 200', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('UpdateCampaignCommand');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Update failed');
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
