import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MockPhoneNormalizer } from '../../../../helpers/MockPhoneNormalizer';

import { SendImageController } from '../../../../../src/infrastructure/http/controllers/messages/SendImageController';

vi.mock('@shared/infrastructure/utils/PhoneNormalizer', () => ({
  PhoneNormalizer: MockPhoneNormalizer,
}));

describe('SendImageController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendImageController;
  let req: Partial<Request>;
  let res: any;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendImageController(mockCommandBus);

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
      locals: { requestId: 'req-123' },
    };

    req = {
      params: { instanceId: 'inst-1' },
      body: {
        to: '521234567890',
        caption: 'My image',
        fileName: 'image.jpg',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    next = vi.fn();
  });

  // =========================
  // HAPPY PATH
  // =========================
  test('should dispatch SendImageCommand successfully', async () => {
    req.file = {
      buffer: Buffer.from('image'),
      size: 999,
    } as Express.Multer.File;

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendImageCommand');
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('521234567890@s.whatsapp.net');
    expect(command.caption).toBe('My image');
    expect(command.fileName).toBe('image.jpg');
    expect(command.image).toBeDefined();
  });

  // =========================
  // FILE REQUIRED
  // =========================
  test('should throw NotFoundError when file is missing', async () => {
    req.file = undefined;

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.constructor.name).toBe('NotFoundError');
    expect(error.message).toBe('Image file is required');
  });

  // =========================
  // PHONE VALIDATION
  // =========================
  test('should fail when phone is invalid', async () => {
    req.file = {
      buffer: Buffer.from('image'),
      size: 999,
    } as Express.Multer.File;

    req.body.to = 'invalid';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Phone invalid');
  });

  // =========================
  // NORMALIZER THROW
  // =========================
  test('should handle normalizer exception', async () => {
    req.file = {
      buffer: Buffer.from('image'),
      size: 999,
    } as Express.Multer.File;

    req.body.to = 'explode';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('normalizer error');
  });

  // =========================
  // OPTIONAL FIELDS
  // =========================
  test('should work without caption and fileName', async () => {
    req.file = {
      buffer: Buffer.from('image'),
      size: 999,
    } as Express.Multer.File;

    req.body.caption = undefined;
    req.body.fileName = undefined;

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.caption).toBeUndefined();
    expect(command.fileName).toBeUndefined();
  });

  // =========================
  // COMMAND FAILURE
  // =========================
  test('should forward commandBus error', async () => {
    req.file = {
      buffer: Buffer.from('image'),
      size: 999,
    } as Express.Multer.File;

    mockCommandBus.dispatch.mockRejectedValue(new Error('dispatch failed'));

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('dispatch failed');
  });
});
