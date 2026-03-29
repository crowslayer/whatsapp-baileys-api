import { ChatsResponse } from '@application/chats/list/ChatsResponse';

import { Query } from '@shared/domain/query/Query';

export class GetChatsQuery extends Query<ChatsResponse> {
  constructor(public readonly instanceId: string) {
    super();
  }
}
