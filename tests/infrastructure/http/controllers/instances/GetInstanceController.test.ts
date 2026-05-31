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

import { GetInstanceController } from '../../../../../src/infrastructure/http/controllers/instances/GetInstanceController';

describe('GetInstanceController', () => {
  let mockQueryBus: {
    ask: ReturnType<typeof vi.fn>;
  };

  let controller: GetInstanceController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQueryBus = {
      ask: vi.fn(),
    };

    controller = new GetInstanceController(mockQueryBus);

    req = {
      params: {
        instanceId: 'inst-1',
      },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('vitest-agent'),
    };

    res = {} as Response;
    next = vi.fn();
  });

  test('should execute query and return success response', async () => {
    mockQueryBus.ask.mockResolvedValue({
      content: {
        id: 'inst-1',
        status: 'CONNECTED',
      },
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).not.toHaveBeenCalled();

    expect(mockQueryBus.ask).toHaveBeenCalledTimes(1);

    const query = mockQueryBus.ask.mock.calls[0][0];

    expect(query.constructor.name).toBe('GetInstanceQuery');

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      {
        id: 'inst-1',
        status: 'CONNECTED',
      },
      'Instance retrieved successfully',
      200,
      expect.any(Object)
    );
  });

  test('should pass instanceId to query', async () => {
    mockQueryBus.ask.mockResolvedValue({
      content: {},
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const query = mockQueryBus.ask.mock.calls[0][0];

    expect(query.instanceId).toBe('inst-1');
  });

  test('should call next when query bus throws', async () => {
    const error = new Error('query failed');

    mockQueryBus.ask.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('should support null content', async () => {
    mockQueryBus.ask.mockResolvedValue({
      content: null,
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mocks.successMock).toHaveBeenCalledWith(
      res,
      null,
      'Instance retrieved successfully',
      200,
      expect.any(Object)
    );
  });

  test('should create audit data', async () => {
    mockQueryBus.ask.mockResolvedValue({
      content: {},
    });

    await controller.handle(req as Request, res as Response, next as NextFunction);

    const audit = mocks.successMock.mock.calls[0][4];

    expect(audit).toBeDefined();
    expect(audit.action).toBe('READ');
  });
});
