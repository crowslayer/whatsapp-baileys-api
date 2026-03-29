import { IChatReadRepository } from '@domain/queries/IChatReadRepository';

import { ChatResponse } from '@application/chats/list/ChatsResponse';
import { GetChatsQuery } from '@application/chats/list/GetChatsQuery';

export class ChatsFinder {
  constructor(private readonly _chatRepository: IChatReadRepository) {}

  async execute(query: GetChatsQuery): Promise<ChatResponse> {
    const chats = await this._chatRepository.findChatsByInstance(query.instanceId);
    return {
      chats,
      chatsCount: chats.length,
    };
  }
}
