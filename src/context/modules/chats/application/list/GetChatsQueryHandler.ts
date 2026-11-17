import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { ChatsFinder } from '@modules/chats/application/list/ChatsFinder';
import { ChatsResponse } from '@modules/chats/application/list/ChatsResponse';
import { GetChatsQuery } from '@modules/chats/application/list/GetChatsQuery';

export class GetChatsQueryHandler implements IQueryHandler<GetChatsQuery, ChatsResponse> {
  constructor(private readonly useCase: ChatsFinder) {}

  subscribedTo(): typeof GetChatsQuery {
    return GetChatsQuery;
  }
  async handle(query: GetChatsQuery): Promise<ChatsResponse> {
    const result = await this.useCase.execute(query);

    return ChatsResponse.create(result);
  }
}
