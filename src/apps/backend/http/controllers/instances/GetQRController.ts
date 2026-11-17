import { NextFunction, Response } from 'express';

import { IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { GetQRCodeQuery } from '@modules/instances/application/qr-code/get/GetQRCodeQuery';
import { QRCodeResponse } from '@modules/instances/application/qr-code/get/QRCodeResponse';

type QrRequet = IHttpRequest & {
  params: { instanceId: string };
};

export class GetQRController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: QrRequet): Promise<HttpResponse<unknown>> {
    const { instanceId } = req.params;

    const query = new GetQRCodeQuery(instanceId);
    const result = await this.queryBus.ask<QRCodeResponse>(query);

    return ResponseBuilder.ok(result.content);
  }

  async renderQRPage(req: QrRequet, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

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
