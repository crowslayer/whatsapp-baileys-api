import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { GroupsQuery } from '@modules/groups/application/list/GroupsQuery';
import { GroupsResponse } from '@modules/groups/application/list/GroupsResponse';

type ListGroupRequest = IHttpRequest & {
  params: { instanceId: string };
};

export class ListGroupsController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: ListGroupRequest): Promise<HttpResponse<unknown>> {
    const { instanceId } = req.params;

    const query = new GroupsQuery(instanceId);
    const result = await this.queryBus.ask<GroupsResponse>(query);

    return ResponseBuilder.ok(result.content);
  }
}
