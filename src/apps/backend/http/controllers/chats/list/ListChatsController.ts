import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { ChatsResponse } from '@modules/chats/application/list/ChatsResponse';
import { GetChatsQuery } from '@modules/chats/application/list/GetChatsQuery';

type ChatsRequest = IHttpRequest & {
  params: { instanceId: string };
};

export class ListChatsController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: ChatsRequest): Promise<HttpResponse<unknown>> {
    const { instanceId } = req.params;

    const query = new GetChatsQuery(instanceId);
    const result = await this.queryBus.ask<ChatsResponse>(query);

    return ResponseBuilder.ok(result.content);
  }
}
