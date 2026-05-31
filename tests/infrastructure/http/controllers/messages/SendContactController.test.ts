import type { Request, Response } from 'express';
import { SendContactController } from '../../../../../src/infrastructure/http/controllers/messages/SendContactController';

describe('SendContactController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendContactController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new SendContactController(mockCommandBus);
    req = {
      params: { instanceId: 'inst-1' },
      body: {
        to: '521234567890@s.whatsapp.net',
        contacts: [{ displayName: 'John', vcard: 'BEGIN:VCARD...' }],
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

  test('should dispatch SendContactCommand and return 200', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('SendContactCommand');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with NotFoundError when contacts array is empty', async () => {
    req.body = { to: '521234567890', contacts: [] };

    await controller.handle(req as Request, res as Response, next);
    expect(next.mock.calls[0][0].constructor.name).toBe('NotFoundError');
  });

  test('should call next with NotFoundError when contacts is missing', async () => {
    req.body = { to: '521234567890' };

    await controller.handle(req as Request, res as Response, next);
    expect(next.mock.calls[0][0].constructor.name).toBe('NotFoundError');
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Send failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should handle contacts without displayName or vcard', async () => {
    req.body = { to: '521234567890@s.whatsapp.net', contacts: [{}] };

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
