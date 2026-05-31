import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MockPhoneNormalizer } from '../../../../helpers/MockPhoneNormalizer';

import { SendLocationController } from '../../../../../src/infrastructure/http/controllers/messages/SendLocationController';

vi.mock('@shared/infrastructure/utils/PhoneNormalizer', () => ({
  PhoneNormalizer: MockPhoneNormalizer,
}));

describe('SendLocationController', () => {
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let controller: SendLocationController;
  let req: Partial<Request>;
  let res: any;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCommandBus = {
      dispatch: vi.fn().mockResolvedValue(undefined),
    };

    controller = new SendLocationController(mockCommandBus);

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
        latitude: '19.4326',
        longitude: '-99.1332',
        name: 'CDMX',
        address: 'Mexico City',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    next = vi.fn();
  });

  // =========================
  // HAPPY PATH
  // =========================
  test('should dispatch SendLocationCommand successfully', async () => {
    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.constructor.name).toBe('SendLocationCommand');
    expect(command.instanceId).toBe('inst-1');
    expect(command.to).toBe('521234567890@s.whatsapp.net');
    expect(command.latitude).toBeCloseTo(19.4326);
    expect(command.longitude).toBeCloseTo(-99.1332);
    expect(command.name).toBe('CDMX');
    expect(command.address).toBe('Mexico City');
  });

  // =========================
  // PHONE INVALID
  // =========================
  test('should fail when phone is invalid', async () => {
    req.body.to = 'invalid';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).not.toHaveBeenCalled();

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('Phone invalid');
  });

  // =========================
  // NORMALIZER ERROR
  // =========================
  test('should handle normalizer exception', async () => {
    req.body.to = 'explode';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('normalizer error');
  });

  // =========================
  // NUMBER PARSING EDGE CASE
  // =========================
  test('should parse numeric strings correctly', async () => {
    req.body.latitude = '0';
    req.body.longitude = '0';

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.latitude).toBe(0);
    expect(command.longitude).toBe(0);
  });

  // =========================
  // COMMAND FAILURE
  // =========================
  test('should forward commandBus error', async () => {
    mockCommandBus.dispatch.mockRejectedValue(new Error('dispatch failed'));

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];
    expect(error.message).toBe('dispatch failed');
  });
});
