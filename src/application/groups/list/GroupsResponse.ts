import { WhatsAppChat } from '@domain/queries/IChatReadRepository';

import { IResponse } from '@shared/domain/Response';

export interface IGroupsResult {
  groups: WhatsAppChat[];
  groupsCount: number;
}

type GroupResponse = IGroupsResult;

export class GroupsResponse implements IResponse {
  content: GroupResponse;

  private constructor(chats: GroupResponse) {
    this.content = chats;
  }

  static create(chats: GroupResponse): GroupsResponse {
    if (!chats) {
      return GroupsResponse.none();
    }
    return new GroupsResponse(chats);
  }

  static none(): GroupsResponse {
    return new GroupsResponse({
      groups: [],
      groupsCount: 0,
    });
  }
}
