import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { NotFoundError } from '@shared/infrastructure/Error/NotFoundError';
import { WhatsAppConnectionError } from '@shared/infrastructure/Error/WhatsAppConnectionError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

import { Controller } from '../Controller';

export class InstanceGetQRController implements Controller {
  constructor(private readonly repository: IWhatsAppInstanceRepository) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const instance = await this.repository.findById(instanceId);
      if (!instance) {
        throw new NotFoundError('Instance not Found');
      }

      if (!instance.qrCode) {
        throw new WhatsAppConnectionError('QR Code not available yet');
      }

      ResponseHandler.success(res, { qrCode: instance.qrCode }, 'QR Code retrieved successfully');
    } catch (error: any) {
      next(error);
    }
  }
}
