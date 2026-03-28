import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { ChatsFinder } from './ChatsFinder';
import { ChatsResponse } from './ChatsResponse';
import { GetChatsQuery } from './GetChatsQuery';

export class GetChatsQueryHandler implements IQueryHandler<GetChatsQuery, ChatsResponse> {
  constructor(private readonly finder: ChatsFinder) {}

  subscribedTo(): typeof GetChatsQuery {
    return GetChatsQuery;
  }
  async handle(query: GetChatsQuery): Promise<ChatsResponse> {
    const result = await this.finder.execute(query);
    if (!result) {
      throw new NotFoundError('no chats founded');
    }
    return ChatsResponse.create(result);
  }
}
