import type { Request, Response } from 'express';
import { AddParticipantsController } from '../../../src/infrastructure/http/controllers/groups/AddParticipantsController';

describe('AddParticipantsController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: AddParticipantsController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };
    controller = new AddParticipantsController(mockCommandBus);
    req = {
      params: { instanceId: 'inst-1', groupId: 'group-1' },
      body: { participants: ['521234567890@s.whatsapp.net'] },
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

  test('should dispatch AddParticipantGroupCommand and return 200', async () => {
    await controller.handle(req as Request, res as Response, next);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    const dispatched = mockCommandBus.dispatch.mock.calls[0][0];
    expect(dispatched.constructor.name).toBe('AddParticipantGroupCommand');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should call next with error when dispatch fails', async () => {
    const error = new Error('Add failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('should call next with error when participants is empty array', async () => {
    req.body = { participants: [] };

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  test('should call next with error when participants is missing', async () => {
    req.body = {};

    await controller.handle(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
