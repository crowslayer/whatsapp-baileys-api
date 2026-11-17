import { Query } from '@shared/domain/query/Query';

import { ChatsResponse } from '@modules/chats/application/list/ChatsResponse';

export class GetChatsQuery extends Query<ChatsResponse> {
  constructor(public readonly instanceId: string) {
    super();
  }
}
