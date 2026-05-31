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

vi.mock('../../../../../src/shared/infrastructure/utils/PhoneNormalizer', () => ({
  PhoneNormalizer: class {
    toJid(phone: string) {
      if (phone === 'explode') {
        throw new Error('normalizer error');
      }
      if (phone === 'invalid') return null;
      return `${phone}@s.whatsapp.net`;
    }
  },
}));

import { SendTextController } from '../../../../../src/infrastructure/http/controllers/messages/SendTextController';

describe('SendTextController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendTextController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendTextController(mockCommandBus);

    req = {
      params: {
        instanceId: 'inst-1',
      },
      body: {
        to: '52234567890',
        message: 'Hello World',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;

    next = vi.fn();
  });

  test('should dispatch command and return success response', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendMessageCommand');
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('52234567890@s.whatsapp.net');
    expect(command.message).toBe('Hello World');
    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      { sent: true },
      'Message sent successfully',
      200,
      expect.any(Object)
    );

    expect(next).not.toHaveBeenCalled();
  });

  test('should call next when dispatch fails', async () => {
    const error = new Error('Send failed');

    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('should call next when phone is invalid', async () => {
    req.body = {
      to: 'invalid',
      message: 'Hello',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();

    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe('Phone invalid');
  });

  test('should call next when ResponseHandler throws', async () => {
    mocks.successMock.mockImplementationOnce(() => {
      throw new Error('response error');
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();

    expect(next.mock.calls[0][0].message).toBe('response error');
  });

  test('should call next when normalizer throws', async () => {
    req.body = {
      to: 'explode',
      message: 'hello',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();

    expect(next.mock.calls[0][0].message).toBe('normalizer error');
  });

  test('should send empty message if controller allows it', async () => {
    req.body = {
      to: '52234567890',
      message: '',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalled();
  });
});
