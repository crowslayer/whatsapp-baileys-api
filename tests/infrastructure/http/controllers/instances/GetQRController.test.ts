import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QRCodeResponse } from '../../../../../src/application/instances/qr-code/get/QRCodeResponse';
import { GetQRController } from '../../../../../src/infrastructure/http/controllers/instances/GetQRController';

describe('GetQRController', () => {
  let mockQueryBus: { ask: ReturnType<typeof vi.fn> };
  let controller: GetQRController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockQueryBus = { ask: vi.fn() };
    controller = new GetQRController(mockQueryBus);
    req = {
      params: { instanceId: 'inst-1' },
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      render: vi.fn(),
      locals: { requestId: 'req-123' },
    } as any;
    next = vi.fn();
  });

  describe('handle', () => {
    test('should return QR code when available', async () => {
      mockQueryBus.ask.mockResolvedValue(
        QRCodeResponse.create({ qrCode: 'qr-data', instanceId: 'inst-1' })
      );

      await controller.handle(req as Request, res as Response, next as NextFunction);

      expect(mockQueryBus.ask).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle missing QR code', async () => {
      const response = QRCodeResponse.create({});
      Object.defineProperty(response, 'content', {
        value: { qrCode: null, instanceId: 'inst-1' },
      });
      mockQueryBus.ask.mockResolvedValue(response);

      await controller.handle(req as Request, res as Response, next as NextFunction);

      expect(res.status).not.toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });

    test('should call next with error when query fails', async () => {
      const error = new Error('Query failed');
      mockQueryBus.ask.mockRejectedValue(error);

      await controller.handle(req as Request, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('renderQRPage', () => {
    test('should render qr-code page when instance found', async () => {
      mockQueryBus.ask.mockResolvedValue(
        QRCodeResponse.create({
          instanceId: 'inst-1',
          name: 'Test',
          qrCode: 'qr-data',
          qrText: 'qr-text',
          qrStatus: 'active',
          phoneNumber: '521234567890',
        })
      );

      await controller.renderQRPage(req as Request, res as Response, next as NextFunction);

      expect(res.render).toHaveBeenCalledWith('qr-code', {
        instanceId: 'inst-1',
        instanceName: 'Test',
        qrCode: 'qr-data',
        qrText: 'qr-text',
        status: 'active',
        phoneNumber: '521234567890',
      });
    });

    test('should render error page when instance not found', async () => {
      mockQueryBus.ask.mockResolvedValue(QRCodeResponse.create(null));

      await controller.renderQRPage(req as Request, res as Response, next as NextFunction);

      expect(res.render).toHaveBeenCalledWith('error', {
        message: 'Instancia no encontrada',
        instanceId: 'inst-1',
      });
    });

    test('should call next with error when render fails', async () => {
      const error = new Error('Render failed');
      mockQueryBus.ask.mockRejectedValue(error);

      await controller.renderQRPage(req as Request, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
