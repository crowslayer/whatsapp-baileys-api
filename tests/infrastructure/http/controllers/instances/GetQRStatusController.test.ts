import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QRCodeStatusResponse } from '../../../../../src/application/instances/qr-code/status/QRCodeStatusResponse';
import { GetQRStatusController } from '../../../../../src/infrastructure/http/controllers/instances/GetQRStatusController';

describe('GetQRStatusController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: GetQRStatusController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new GetQRStatusController(mockQueryBus);
    req = {
      params: { instanceId: 'inst-1' },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: { requestId: 'req-123' },
    } as any;
    next = vi.fn();
  });

  test('should return QR status when available', async () => {
    const mockContent = { qrCode: 'qr-data', status: 'active' };
    const response = QRCodeStatusResponse.create(mockContent);
    mockQueryBus.ask.mockResolvedValue(response);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(mockQueryBus.ask).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalled();
  });

  test('should call next with NotFoundError when instance not found', async () => {
    mockQueryBus.ask.mockResolvedValue(null);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].constructor.name).toBe('NotFoundError');
  });

  test('should call next with WhatsAppConnectionError when QR not available', async () => {
    const response = QRCodeStatusResponse.create({ qrCode: null });
    mockQueryBus.ask.mockResolvedValue(response);

    await controller.handle(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].constructor.name).toBe('WhatsAppConnectionError');
  });

  test('should call next with error when query fails', async () => {
    const error = new Error('Query failed');
    mockQueryBus.ask.mockRejectedValue(error);

    await controller.handle(req as Request, res as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(error);
  });
});
