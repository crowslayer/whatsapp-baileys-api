import { IChatReadRepository } from '@domain/queries/IChatReadRepository';

import { IGroupsResult } from '@application/groups/list/GroupsResponse';

export class GroupsFinder {
  constructor(private readonly repository: IChatReadRepository) {}

  async execute(instanceId: string): Promise<IGroupsResult> {
    const groups = await this.repository.findGroupsByInstance(instanceId);

    return {
      groups,
      groupsCount: groups.length,
    };
  }
}
