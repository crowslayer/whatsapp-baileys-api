import type { Request, Response } from 'express';
import { CampaignResponse } from '../../../../../src/application/campaign/CampaignResponse';
import { FindCampaignByIdController } from '../../../../../src/infrastructure/http/controllers/campaign/FindCampaignByIdController';

describe('FindCampaignByIdController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: FindCampaignByIdController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new FindCampaignByIdController(mockQueryBus);
    req = {
      params: { campaignId: 'camp-1' },
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
    mockQueryBus.ask.mockResolvedValue(CampaignResponse.create({ id: 'camp-1', name: 'Test' }));

    await controller.handle(req as Request, res as Response, next);

    expect(mockQueryBus.ask).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('should call next with error when query fails', async () => {
    const error = new Error('Not found');
    mockQueryBus.ask.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should handle empty result', async () => {
    mockQueryBus.ask.mockResolvedValue({ content: null });

    await controller.handle(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
