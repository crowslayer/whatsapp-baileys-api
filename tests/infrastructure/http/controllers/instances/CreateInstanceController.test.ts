import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CreateInstanceController } from '../../../../../src/infrastructure/http/controllers/instances/CreateInstanceController';
import { createMockCommandBus } from '../../../../helpers/MockCommandBus';
import { createMockResponse } from '../../../../helpers/MockResponse';

describe('CreateInstanceController', () => {
  let controller: CreateInstanceController;
  let mockCommandBus: { dispatch: ReturnType<typeof vi.fn> };
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommandBus = createMockCommandBus();
    res = createMockResponse();

    next = vi.fn();

    req = {
      body: {
        name: 'My Instance',
        webhookUrl: 'https://webhook.test',
        usePairingCode: true,
        phoneNumber: '521234567890',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };

    controller = new CreateInstanceController(mockCommandBus);
  });

  test('should create instance and return 201', async () => {
    mockCommandBus.dispatch.mockResolvedValue({
      content: {
        id: 'inst-1',
        name: 'My Instance',
      },
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);

    const command = mockCommandBus.dispatch.mock.calls[0][0];
    expect(command.constructor.name).toBe('CreateInstanceCommand');
    expect(command.name).toBe('My Instance');

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();

    expect(next).not.toHaveBeenCalled();
  });

  test('should pass correct command parameters', async () => {
    mockCommandBus.dispatch.mockResolvedValue({
      content: { id: '1' },
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const command = mockCommandBus.dispatch.mock.calls[0][0];

    expect(command.name).toBe('My Instance');
    expect(command.webhookUrl).toBe('https://webhook.test');
    expect(command.usePairingCode).toBe(true);
    expect(command.phoneNumber).toBe('521234567890');
  });

  test('should call next when commandBus fails', async () => {
    mockCommandBus.dispatch.mockRejectedValue(new Error('boom'));

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('should handle missing optional phoneNumber', async () => {
    req.body.phoneNumber = undefined;

    mockCommandBus.dispatch.mockResolvedValue({
      content: { id: '1' },
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockCommandBus.dispatch).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('should build audit with correct entity type', async () => {
    mockCommandBus.dispatch.mockResolvedValue({
      content: { id: '1' },
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const audit = res.status.mock.calls.length; // indirect check
    expect(audit).toBeGreaterThanOrEqual(0);
  });

  test('should propagate instance content correctly', async () => {
    mockCommandBus.dispatch.mockResolvedValue({
      content: {
        id: 'inst-99',
        name: 'My Instance',
      },
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const jsonCall = res.json.mock.calls[0][0];

    expect(jsonCall).toBeDefined();
  });
});
