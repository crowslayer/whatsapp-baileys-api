import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { GetFlowQuery } from '@modules/flows/application/get/GetFlowQuery';

type FlowRequest = IHttpRequest & {
  params: { flowId: string };
};

export class GetFlowController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: FlowRequest): Promise<HttpResponse<unknown>> {
    const { flowId } = req.params;

    const query = new GetFlowQuery(flowId);
    const instance = await this.queryBus.ask(query);

    return ResponseBuilder.ok(instance.content);
  }
}
