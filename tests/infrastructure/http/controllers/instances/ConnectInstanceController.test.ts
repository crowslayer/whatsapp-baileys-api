import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ConnectInstanceController } from '../../../../../src/infrastructure/http/controllers/instances/ConnectInstanceController';

const mocks = vi.hoisted(() => ({
  createdMock: vi.fn(),
}));

vi.mock('../../../../../src/shared/infrastructure/ResponseHandler', () => ({
  ResponseHandler: {
    created: mocks.createdMock,
  },
}));

describe('ConnectInstanceController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: ConnectInstanceController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn(),
    };

    controller = new ConnectInstanceController(mockCommandBus);

    req = {
      body: {
        instanceId: 'inst-1',
        usePairingCode: true,
        phoneNumber: '521234567890',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should dispatch command and return created response', async () => {
    mockCommandBus.dispatch.mockResolvedValue({
      id: 'inst-1',
      status: 'connected',
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    expect(mocks.createdMock).toHaveBeenCalledTimes(1);

    const call = mocks.createdMock.mock.calls[0];

    expect(call[0]).toBe(res);
    expect(call[1]).toEqual({
      id: 'inst-1',
      status: 'connected',
    });

    expect(call[2]).toBe('Instance connected successfully');
  });

  test('should call next when dispatch fails', async () => {
    const error = new Error('connect failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
  });
});
