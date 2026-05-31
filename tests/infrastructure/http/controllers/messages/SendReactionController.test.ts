import type { Request, Response } from 'express';
import { SendReactionController } from '../../../../../src/infrastructure/http/controllers/messages/SendReactionController';

describe('SendReactionController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendReactionController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new SendReactionController(mockCommandBus);
    req = {
      params: { instanceId: 'inst-1' },
      body: { messageId: 'msg-1', emoji: '❤️', chatId: '123@s.whatsapp.net' },
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

  test('should dispatch SendReactionCommand and return 200', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('SendReactionCommand');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Send failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should call next with error when messageId is missing', async () => {
    req.body = { emoji: '❤️', chatId: '123@s.whatsapp.net' };

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('should call next with error when emoji is missing', async () => {
    req.body = { messageId: 'msg-1', chatId: '123@s.whatsapp.net' };

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
