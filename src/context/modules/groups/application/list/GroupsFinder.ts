import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

import { IChatSynchronizer } from '@modules/chats/application/synchronize/IChatSynchronizer';
import { IChatReadRepository } from '@modules/chats/domain/IChatReadRepository';
import { IGroupsResult } from '@modules/groups/application/list/GroupsResponse';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';

export class GroupsFinder {
  constructor(
    private readonly repository: IChatReadRepository,
    private readonly runtimeManager: IRuntimeManager,
    private readonly chatSync: IChatSynchronizer
  ) {}

  async execute(instanceId: string): Promise<IGroupsResult> {
    let groups = await this.repository.findGroupsByInstance(instanceId);

    if (groups.length === 0) {
      const adapter = this.runtimeManager.get(instanceId);

      if (!adapter) {
        throw new InstanceNotFoundError('Instances Not Found');
      }
      const freshGroups = await adapter.groups.syncGroupsMetadata();

      const groupParse = freshGroups.map((group) => {
        return { ...group, instanceId };
      });

      this.chatSync.syncChats(instanceId, groupParse, false);

      groups = await this.repository.findGroupsByInstance(instanceId);
    }

    return {
      groups,
      groupsCount: groups.length,
    };
  }
}
