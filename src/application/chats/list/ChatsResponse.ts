import { WhatsAppChat } from '@domain/queries/IChatReadRepository';

import { IResponse } from '@shared/domain/Response';

export interface IGetChatsResult {
  all: WhatsAppChat[];
  individual: WhatsAppChat[];
  groups: WhatsAppChat[];
  totalCount: number;
  individualCount: number;
  groupCount: number;
}

export class ChatsResponse implements IResponse {
  content: IGetChatsResult;

  private constructor(chats: IGetChatsResult) {
    this.content = chats;
  }

  static create(chats: IGetChatsResult): ChatsResponse {
    if (!chats) {
      throw new Error('Not Found Chats');
    }
    return new ChatsResponse(chats);
  }

  static none(): ChatsResponse {
    return new ChatsResponse({
      all: [],
      individual: [],
      groups: [],
      groupCount: 0,
      totalCount: 0,
      individualCount: 0,
    });
  }
}
