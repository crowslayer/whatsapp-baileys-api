import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MockPhoneNormalizer } from '../../../../helpers/MockPhoneNormalizer';

import { SendContactController } from '../../../../../src/infrastructure/http/controllers/messages/SendContactController';

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

describe('SendContactController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendContactController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendContactController(mockCommandBus);

    req = {
      params: { instanceId: 'inst-1' },
      body: {
        to: '521234567890',
        contacts: [
          {
            displayName: 'John',
            vcard: 'BEGIN:VCARD',
          },
        ],
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  // =========================
  // HAPPY PATH
  // =========================
  test('should dispatch SendContactCommand successfully', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendContactCommand');
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('521234567890@s.whatsapp.net');

    expect(command.contacts).toEqual([
      {
        displayName: 'John',
        vcard: 'BEGIN:VCARD',
      },
    ]);
  });

  // =========================
  // CONTACT VALIDATION
  // =========================
  test('should throw NotFoundError when contacts is missing', async () => {
    req.body = { to: '521234567890' };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error.constructor.name).toBe('NotFoundError');
  });

  test('should throw NotFoundError when contacts is empty array', async () => {
    req.body = { to: '521234567890', contacts: [] };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error.constructor.name).toBe('NotFoundError');
  });

  test('should throw NotFoundError when contacts is not an array', async () => {
    req.body = { to: '521234567890', contacts: 'invalid' };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error.constructor.name).toBe('NotFoundError');
  });

  // =========================
  // CONTACT NORMALIZATION
  // =========================
  test('should normalize contacts with missing fields', async () => {
    req.body = {
      to: '521234567890',
      contacts: [{}],
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.contacts).toEqual([
      {
        displayName: 'Contact',
        vcard: '',
      },
    ]);
  });

  test('should normalize mixed valid and partial contacts', async () => {
    req.body = {
      to: '521234567890',
      contacts: [{ displayName: 'John', vcard: 'VCARD1' }, {}],
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.contacts).toEqual([
      { displayName: 'John', vcard: 'VCARD1' },
      { displayName: 'Contact', vcard: '' },
    ]);
  });

  // =========================
  // PHONE VALIDATION
  // =========================
  test('should fail when phone is invalid', async () => {
    req.body = {
      to: 'invalid',
      contacts: [{ displayName: 'John', vcard: 'VCARD' }],
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Phone invalid');
  });

  test('should handle normalizer exception', async () => {
    req.body = {
      to: 'explode',
      contacts: [{ displayName: 'John', vcard: 'VCARD' }],
    };

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('normalizer error');
  });

  // =========================
  // COMMAND FAILURE
  // =========================
  test('should forward error when dispatch fails', async () => {
    const error = new Error('dispatch failed');
    mockCommandBus.dispatch.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
  });
});
