import type { Request, Response } from 'express';
import { ChatsResponse } from '../../../src/application/chats/list/ChatsResponse';
import { ListChatsController } from '../../../src/infrastructure/http/controllers/chats/list/ListChatsController';

describe('ListChatsController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: ListChatsController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new ListChatsController(mockQueryBus);
    req = {
      params: { instanceId: 'inst-1' },
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
    mockQueryBus.ask.mockResolvedValue(ChatsResponse.create([{ id: 'chat-1', name: 'Test' }]));

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

  test('should handle empty chats list', async () => {
    mockQueryBus.ask.mockResolvedValue(ChatsResponse.create([]));

    await controller.handle(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
