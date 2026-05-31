import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  successMock: vi.fn(),
}));

vi.mock('../../../../../src/shared/infrastructure/ResponseHandler', () => ({
  ResponseHandler: {
    success: mocks.successMock,
  },
}));

import { DisconnectInstanceController } from '../../../../../src/infrastructure/http/controllers/instances/DisconnectInstanceController';

describe('DisconnectInstanceController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: DisconnectInstanceController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new DisconnectInstanceController(mockCommandBus);

    req = {
      params: {
        instanceId: 'inst-1',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should dispatch DisconnectInstanceCommand and return success response', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('DisconnectInstanceCommand');
    expect(command.instanceId).toBe('inst-1');

    expect(mocks.successMock).toHaveBeenCalledTimes(1);

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      null,
      'Instance disconnected successfully',
      200,
      expect.any(Object)
    );
  });

  test('should call next when dispatch fails', async () => {
    const error = new Error('disconnect failed');

    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);

    expect(mocks.successMock).not.toHaveBeenCalled();
  });
});
