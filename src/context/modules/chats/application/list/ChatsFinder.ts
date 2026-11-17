import { ChatResponse } from '@modules/chats/application/list/ChatsResponse';
import { GetChatsQuery } from '@modules/chats/application/list/GetChatsQuery';
import { IChatReadRepository } from '@modules/chats/domain/IChatReadRepository';

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
