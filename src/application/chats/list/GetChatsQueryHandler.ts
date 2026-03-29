import { ChatsFinder } from '@application/chats/list/ChatsFinder';
import { ChatsResponse } from '@application/chats/list/ChatsResponse';
import { GetChatsQuery } from '@application/chats/list/GetChatsQuery';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class GetChatsQueryHandler implements IQueryHandler<GetChatsQuery, ChatsResponse> {
  constructor(private readonly finder: ChatsFinder) {}

  subscribedTo(): typeof GetChatsQuery {
    return GetChatsQuery;
  }
  async handle(query: GetChatsQuery): Promise<ChatsResponse> {
    const result = await this.finder.execute(query);

    return ChatsResponse.create(result);
  }
}
