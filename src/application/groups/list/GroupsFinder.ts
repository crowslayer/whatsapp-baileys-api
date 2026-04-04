import { IChatReadRepository } from '@domain/queries/IChatReadRepository';

import { IChatSynchronizer } from '@application/chats/synchronize/IChatSynchronizer';
import { IGroupsResult } from '@application/groups/list/GroupsResponse';

import { IConnectionManager } from '@infrastructure/baileys/IConnectionManager';

export class GroupsFinder {
  constructor(
    private readonly repository: IChatReadRepository,
    private readonly connectionManager: IConnectionManager,
    private readonly chatSync: IChatSynchronizer
  ) {}

  async execute(instanceId: string): Promise<IGroupsResult> {
    let groups = await this.repository.findGroupsByInstance(instanceId);

    if (groups.length === 0) {
      const adapter = this.connectionManager.getConnection(instanceId);

      if (!adapter) {
        throw new Error('Instances Not Found');
      }
      const freshGroups = await adapter.syncGroupsMetadata();
      this.chatSync.syncChats(instanceId, freshGroups, false);

      groups = await this.repository.findGroupsByInstance(instanceId);
    }

    return {
      groups,
      groupsCount: groups.length,
    };
  }
}
