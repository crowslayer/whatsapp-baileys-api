import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { GetInstanceQuery } from '@modules/instances/application/get/GetInstanceQuery';

type GetInstanceRequest = IHttpRequest & {
  params: { instanceId: string };
};

export class GetInstanceController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: GetInstanceRequest): Promise<HttpResponse<unknown>> {
    const { instanceId } = req.params;

    const query = new GetInstanceQuery(instanceId);
    const result = await this.queryBus.ask(query);

    return ResponseBuilder.ok(result.content);
  }
}
