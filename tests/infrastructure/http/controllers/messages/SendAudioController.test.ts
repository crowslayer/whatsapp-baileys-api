import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MockPhoneNormalizer } from '../../../../helpers/MockPhoneNormalizer';

const mocks = vi.hoisted(() => ({
  successMock: vi.fn(),
}));

vi.mock('../../../../../src/shared/infrastructure/ResponseHandler', () => ({
  ResponseHandler: {
    success: mocks.successMock,
  },
}));

vi.mock('@shared/infrastructure/utils/PhoneNormalizer', () => ({
  PhoneNormalizer: MockPhoneNormalizer,
}));

import { SendAudioController } from '../../../../../src/infrastructure/http/controllers/messages/SendAudioController';
import { NotFoundError } from '../../../../../src/shared/infrastructure/errors/NotFoundError';

describe('SendAudioController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendAudioController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendAudioController(mockCommandBus);

    req = {
      params: {
        instanceId: 'inst-1',
      },
      body: {
        to: '52234567890',
        ptt: 'true',
      },
      file: {
        buffer: Buffer.from('audio'),
        mimetype: 'audio/ogg',
        size: 1024,
      } as Express.Multer.File,
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should dispatch SendAudioCommand and return success', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendAudioCommand');

    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('52234567890@s.whatsapp.net');
    expect(command.ptt).toBe(true);
    expect(command.mimetype).toBe('audio/ogg');

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      { sent: true },
      'Audio sent successfully',
      200,
      expect.any(Object)
    );

    expect(next).not.toHaveBeenCalled();
  });

  test('should dispatch with ptt=false', async () => {
    req.body = {
      to: '52234567890',
      ptt: 'false',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.ptt).toBe(false);
  });

  test('should call next with NotFoundError when file is missing', async () => {
    req.file = undefined;

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();

    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe('Audio file is required');
  });

  test('should call next when phone is invalid', async () => {
    req.body = {
      to: 'invalid',
      ptt: 'true',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe('Phone invalid');
  });

  test('should call next when dispatch fails', async () => {
    const error = new Error('Dispatch failed');

    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('should call next when normalizer throws', async () => {
    req.body = {
      to: 'explode',
      message: 'hello',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    expect(next.mock.calls[0][0].message).toBe('normalizer error');
  });

  test('should create audit using uploaded file size', async () => {
    req.file = {
      buffer: Buffer.from('audio'),
      mimetype: 'audio/mp3',
      size: 9999,
    } as Express.Multer.File;

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      { sent: true },
      'Audio sent successfully',
      200,
      expect.any(Object)
    );
  });
});
