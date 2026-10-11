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

vi.mock('../../../../../src/shared/infrastructure/ResponseHandler', () => ({
  ResponseHandler: { success: mocks.successMock },
}));

import { SendReactionCommand } from '../../../../../src/application/messages/reaction/SendReactionCommand';
import { StatusCode } from '../../../../../src/infrastructure/http/StatusCode';
import { ValidationError } from '../../../../../src/shared/infrastructure/errors/ValidationError';

describe('SendReactionController', () => {
  let controller: SendReactionController;
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = { dispatch: vi.fn().mockResolvedValue(undefined) };

    controller = new SendReactionController(mockCommandBus as any);

    req = {
      params: { instanceId: 'inst-1' },
      body: { messageId: 'msg-123', emoji: '🔥', chatId: 'chat-1', fromMe: true },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should dispatch SendReactionCommand successfully', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledOnce();

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command).toBeInstanceOf(SendReactionCommand);
    expect(command.instanceId).toBe('inst-1');
    expect(command.message).toEqual({ messageId: 'msg-123', chatId: 'chat-1', fromMe: true });
    expect(command.emoji).toBe('🔥');

    expect(mocks.successMock).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail when messageId is missing', async () => {
    req.body = { emoji: '🔥', chatId: 'chat-1', fromMe: true };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));

    const error = next.mock.calls[0][0];
    expect(error.message).toContain('messageId is required');
  });

  test('should fail when emoji is missing', async () => {
    req.body = { messageId: 'msg-123', chatId: 'chat-1', fromMe: true };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));

    const error = next.mock.calls[0][0];
    expect(error.message).toContain('emoji is required');
  });

  test('should propagate errors when dispatch fails', async () => {
    const dispatchError = new Error('boom');
    mockCommandBus.dispatch.mockRejectedValue(dispatchError);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(dispatchError);
    expect(mocks.successMock).not.toHaveBeenCalled();
  });

  test('should allow missing chatId when the controller does not validate it', async () => {
    req.body = { messageId: 'msg-123', emoji: '👍', fromMe: true };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledOnce();

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.message.chatId).toBeUndefined();
    expect(command.message.messageId).toBe('msg-123');
    expect(command.message.fromMe).toBe(true);

    expect(mocks.successMock).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  test('should build the success response with audit data', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      { sent: true },
      'Reaction sent successfully',
      StatusCode.SuccessOK,
      expect.objectContaining({ resourceId: 'inst-1' })
    );
  });
});
