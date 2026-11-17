import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { ListInstancesQuery } from '@modules/instances/application/list/ListInstancesQuery';

export class GetInstancesController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(_req: IHttpRequest): Promise<HttpResponse<unknown>> {
    const query = new ListInstancesQuery();
    const result = await this.queryBus.ask(query);

    return ResponseBuilder.ok(result.content);
  }
}
