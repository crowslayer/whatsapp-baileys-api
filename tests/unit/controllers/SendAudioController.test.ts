import type { Request, Response } from 'express';
import { SendAudioController } from '../../../src/infrastructure/http/controllers/messages/SendAudioController';

describe('SendAudioController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendAudioController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new SendAudioController(mockCommandBus);
    req = {
      params: { instanceId: 'inst-1' },
      body: { to: '521234567890@s.whatsapp.net', ptt: 'true' },
      file: { buffer: Buffer.from('test'), size: 300, mimetype: 'audio/ogg', originalname: 'audio.ogg' } as any,
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

  test('should dispatch SendAudioCommand and return 200', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('SendAudioCommand');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with NotFoundError when file is missing', async () => {
    req.file = undefined;

    await controller.handle(req as Request, res as Response, next);
    expect(next.mock.calls[0][0].constructor.name).toBe('NotFoundError');
  });

  test('should handle ptt as false', async () => {
    req.body = { to: '521234567890@s.whatsapp.net', ptt: 'false' };

    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Send failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
