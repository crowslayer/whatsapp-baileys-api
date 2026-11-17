import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { ListFlowsQuery } from '@modules/flows/application/list/ListFlowsQuery';

type FlowRequest = IHttpRequest & {
  params: { instanceId: string };
};

export class ListFlowsController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: FlowRequest): Promise<HttpResponse<unknown>> {
    const instanceId = req.params.instanceId;

    const query = new ListFlowsQuery(instanceId);
    const result = await this.queryBus.ask(query);

    return ResponseBuilder.ok(result.content);
  }
}
