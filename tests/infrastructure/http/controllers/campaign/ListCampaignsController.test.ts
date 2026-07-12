import type { Request, Response } from 'express';
import { beforeEach, describe, expect, vi } from 'vitest';
import { CampaignsResponse } from '../../../../../src/application/campaign/CampaignsResponse';
import { ListCampaignsController } from '../../../../../src/infrastructure/http/controllers/campaign/ListCampaignsController';

describe('ListCampaignsController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: ListCampaignsController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new ListCampaignsController(mockQueryBus);
    req = {
      params: {},
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
    mockQueryBus.ask.mockResolvedValue(CampaignsResponse.create([{ id: 'camp-1', name: 'Test' }]));

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

  test('should use query params limit and skip', async () => {
    req.params = { limit: '10', skip: '0' };
    mockQueryBus.ask.mockResolvedValue(CampaignsResponse.create([]));

    await controller.handle(req as Request, res as Response, next);

    expect(mockQueryBus.ask).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
