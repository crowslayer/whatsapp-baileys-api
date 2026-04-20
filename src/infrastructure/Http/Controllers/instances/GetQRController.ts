import { NextFunction, Request, Response } from 'express';

import { GetQRCodeQuery } from '@application/instances/qr-code/get/GetQRCodeQuery';
import { QRCodeResponse } from '@application/instances/qr-code/get/QRCodeResponse';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GetQRController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const query = new GetQRCodeQuery(instanceId);
      const instance = await this.queryBus.ask<QRCodeResponse>(query);

      const content = instance.content;
      if (!content.qrCode) {
        return ResponseHandler.success(res, content, 'QR Code not available yet');
      }

      ResponseHandler.success(res, content, 'QR Code retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async renderQRPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      // const instance = await this.repository.findById(instanceId);
      const query = new GetQRCodeQuery(instanceId);
      const response = await this.queryBus.ask<QRCodeResponse>(query);
      const instance = response.content;

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
        status: instance.qrStatus,
        phoneNumber: instance.phoneNumber,
      });
      return;
    } catch (error) {
      next(error);
    }
  }
}
