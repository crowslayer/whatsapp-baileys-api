import { WhatsAppChat } from '@domain/queries/IChatReadRepository';

import { IResponse } from '@shared/domain/Response';

interface IGetChatsResult {
  chats: WhatsAppChat[];
  chatsCount: number;
}

export type ChatResponse = IGetChatsResult;

export class ChatsResponse implements IResponse {
  content: ChatResponse;

  private constructor(chats: ChatResponse) {
    this.content = chats;
  }

  static create(chats: ChatResponse): ChatsResponse {
    if (!chats) {
      return ChatsResponse.none();
    }
    return new ChatsResponse(chats);
  }

  static none(): ChatsResponse {
    return new ChatsResponse({
      chats: [],
      chatsCount: 0,
    });
  }
}
