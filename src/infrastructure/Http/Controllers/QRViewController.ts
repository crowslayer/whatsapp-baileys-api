import { NextFunction, Request, Response } from 'express';
import pino from 'pino';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { NotFoundError } from '@shared/infrastructure/Error/NotFoundError';

export class QRViewController {
  private logger = pino();

  constructor(private repository: IWhatsAppInstanceRepository) {}

  async renderQRPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const instance = await this.repository.findById(instanceId);

      if (!instance) {
        return res.status(404).render('error', {
          message: 'Instancia no encontrada',
          instanceId,
        });
      }

      res.render('qr-code', {
        instanceId: instance.instanceId,
        instanceName: instance.name,
        qrCode: instance.qrCode,
        qrText: instance.qrText,
        status: instance.status.value,
        phoneNumber: instance.phoneNumber?.value,
      });
      return;
    } catch (error: any) {
      next(error);
    }
  }

  async getQRStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const instance = await this.repository.findById(instanceId);

      if (!instance) {
        throw new NotFoundError('Instance not found');
      }

      res.json({
        status: instance.status.value,
        qrCode: instance.qrCode,
        qrText: instance.qrText,
        phoneNumber: instance.phoneNumber?.value,
        connected: instance.status.isConnected(),
      });
      return;
    } catch (error: any) {
      next(error);
    }
  }
}
