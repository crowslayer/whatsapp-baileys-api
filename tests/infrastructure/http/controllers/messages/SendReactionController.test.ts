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

vi.mock('@shared/infrastructure/utils/PhoneNormalizer', () => ({
  PhoneNormalizer: MockPhoneNormalizer,
}));

import { SendReactionController } from '../../../../../src/infrastructure/http/controllers/messages/SendReactionController';
import { MockPhoneNormalizer } from '../../../../helpers/MockPhoneNormalizer';

describe('SendReactionController', () => {
  let controller: SendReactionController;
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendReactionController(mockCommandBus);

    req = {
      params: { instanceId: 'inst-1' },
      body: {
        messageId: 'msg-123',
        emoji: '🔥',
        chatId: 'chat-1',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should dispatch SendReactionCommand successfully', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendReactionCommand');
    expect(command.instanceId).toBe('inst-1');
    expect(command.messageId).toBe('msg-123');
    expect(command.emoji).toBe('🔥');

    expect(mocks.successMock).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail when messageId is missing', async () => {
    req.body = { emoji: '🔥', chatId: 'chat-1' };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.name).toContain('ValidationError');
  });

  test('should fail when emoji is missing', async () => {
    req.body = { messageId: 'msg-1', chatId: 'chat-1' };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.name).toContain('ValidationError');
  });

  test('should fail when dispatch throws', async () => {
    mockCommandBus.dispatch.mockRejectedValue(new Error('boom'));

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should allow missing chatId (edge case)', async () => {
    req.body = {
      messageId: 'msg-1',
      emoji: '👍',
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];
    expect(command.chatId).toBeUndefined();

    expect(mocks.successMock).toHaveBeenCalledTimes(1);
  });

  test('should build audit correctly via ResponseHandler', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      { sent: true },
      'Reaction sent successfully',
      expect.any(Number),
      expect.any(Object)
    );
  });
});
