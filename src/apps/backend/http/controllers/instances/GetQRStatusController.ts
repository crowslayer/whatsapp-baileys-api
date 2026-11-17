import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { GetQRCodeStatusQuery } from '@modules/instances/application/qr-code/status/GetQRCodeStatusQuery';
import { QRCodeStatusResponse } from '@modules/instances/application/qr-code/status/QRCodeStatusResponse';

type QrStatusRequest = IHttpRequest & {
  params: { instanceId: string };
};

export class GetQRStatusController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: QrStatusRequest): Promise<HttpResponse<unknown>> {
    const { instanceId } = req.params;

    const query = new GetQRCodeStatusQuery(instanceId);
    const result = await this.queryBus.ask<QRCodeStatusResponse>(query);

    return ResponseBuilder.ok(result.content);
  }
}
