import { NextFunction, Request, Response } from 'express';

import { GetQRCodeStatusQuery } from '@application/instances/qr-code/status/GetQRCodeStatusQuery';
import { QRCodeStatusResponse } from '@application/instances/qr-code/status/QRCodeStatusResponse';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GetQRStatusController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const query = new GetQRCodeStatusQuery(instanceId);
      const instance = await this.queryBus.ask<QRCodeStatusResponse>(query);
      if (!instance) {
        throw new NotFoundError('Instance not Found');
      }
      const content = instance.content;
      if (!content.qrCode) {
        throw new WhatsAppConnectionError('QR Code not available yet');
      }

      ResponseHandler.success(res, content, 'QR Code retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
