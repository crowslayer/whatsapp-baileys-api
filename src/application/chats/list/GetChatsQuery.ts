import { Query } from '@shared/domain/query/Query';

import { ChatsResponse } from './ChatsResponse';

export type ChatFilterType = 'all' | 'individual' | 'group';

export class GetChatsQuery extends Query<ChatsResponse> {
  constructor(
    public readonly instanceId: string,
    public readonly filter: ChatFilterType = 'all'
  ) {
    super();
  }
}
