import { IChatReadRepository, WhatsAppChat } from '@domain/queries/IChatReadRepository';

import { IGetChatsResult } from './ChatsResponse';
import { GetChatsQuery } from './GetChatsQuery';

export class ChatsFinder {
  constructor(private readonly _chatRepository: IChatReadRepository) {}

  async execute(query: GetChatsQuery): Promise<IGetChatsResult> {
    let allChats: WhatsAppChat[];
    let individualChats: WhatsAppChat[];
    let groupChats: WhatsAppChat[];

    switch (query.filter) {
      case 'individual':
        individualChats = await this._chatRepository.findIndividualByInstance(query.instanceId);
        groupChats = [];
        allChats = individualChats;
        break;

      case 'group':
        groupChats = await this._chatRepository.findGroupsByInstance(query.instanceId);
        individualChats = [];
        allChats = groupChats;
        break;

      default:
        allChats = await this._chatRepository.findByInstance(query.instanceId);
        individualChats = allChats.filter((c) => c.type === 'individual');
        groupChats = allChats.filter((c) => c.type === 'group');
        break;
    }

    return {
      all: allChats,
      individual: individualChats,
      groups: groupChats,
      totalCount: allChats.length,
      individualCount: individualChats.length,
      groupCount: groupChats.length,
    };
  }
}
