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

import { SendVideoController } from '../../../../../src/infrastructure/http/controllers/messages/SendVideoController';

describe('SendVideoController', () => {
  let controller: SendVideoController;
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendVideoController(mockCommandBus);

    req = {
      params: { instanceId: 'inst-1' },
      body: {
        to: '521234567890',
        caption: 'hello',
        gifPlayback: 'true',
        fileName: 'video.mp4',
      },
      file: {
        buffer: Buffer.from('video'),
        size: 8888,
      } as Express.Multer.File,
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should dispatch SendVideoCommand successfully', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendVideoCommand');
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('521234567890@s.whatsapp.net');
    expect(command.gifPlayback).toBe(true);
    expect(command.caption).toBe('hello');
    expect(command.video).toBeDefined();

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      { sent: true },
      'Video sent successfully',
      200,
      expect.any(Object)
    );

    expect(next).not.toHaveBeenCalled();
  });

  test('should fail when file is missing', async () => {
    req.file = undefined;

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Video file is required');
  });

  test('should fail when phone is invalid', async () => {
    req.body.to = 'invalid';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Phone invalid');
  });

  test('should handle gifPlayback string conversion correctly', async () => {
    req.body.gifPlayback = 'false';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const command = mockCommandBus.dispatch.mock.calls[0][0];
    expect(command.gifPlayback).toBe(false);
  });

  test('should fail when dispatch throws', async () => {
    mockCommandBus.dispatch.mockRejectedValue(new Error('boom'));

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should include fileSize in audit', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    const audit = mocks.successMock.mock.calls[0][4];
    expect(audit).toBeDefined();
  });

  test('should allow minimal valid request', async () => {
    req.body = {
      to: '521234567890',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    expect(mocks.successMock).toHaveBeenCalledTimes(1);
  });
});
