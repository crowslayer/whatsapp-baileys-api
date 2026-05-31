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

import { SendStickerController } from '../../../../../src/infrastructure/http/controllers/messages/SendStickerController';

describe('SendStickerController', () => {
  let controller: SendStickerController;
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendStickerController(mockCommandBus);

    req = {
      params: { instanceId: 'inst-1' },
      body: { to: '521234567890' },
      file: {
        buffer: Buffer.from('sticker'),
        size: 1234,
      } as Express.Multer.File,
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should dispatch SendStickerCommand successfully', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendStickerCommand');
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('521234567890@s.whatsapp.net');
    expect(command.sticker).toBeDefined();

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      { sent: true },
      'Sticker sent successfully',
      expect.any(Number),
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
    expect(error.message).toBe('Sticker file is required');
  });

  test('should fail when phone is invalid', async () => {
    req.body.to = 'invalid';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Phone invalid');
  });

  test('should fail when dispatch throws', async () => {
    mockCommandBus.dispatch.mockRejectedValue(new Error('boom'));

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should include file size in audit', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    const call = mocks.successMock.mock.calls[0];
    const audit = call[4];

    expect(audit).toBeDefined();
    expect(typeof audit).toBe('object');
  });

  test('should handle minimal valid request', async () => {
    req.body = { to: '521234567890' };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    expect(mocks.successMock).toHaveBeenCalledTimes(1);
  });
});
