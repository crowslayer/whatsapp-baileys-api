import { GroupsFinder } from '@application/groups/list/GroupsFinder';
import { GroupsQuery } from '@application/groups/list/GroupsQuery';
import { GroupsResponse } from '@application/groups/list/GroupsResponse';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class GroupsQueryHandler implements IQueryHandler<GroupsQuery, GroupsResponse> {
  constructor(private readonly finder: GroupsFinder) {}

  subscribedTo(): typeof GroupsQuery {
    return GroupsQuery;
  }

  async handle(query: GroupsQuery): Promise<GroupsResponse> {
    const result = await this.finder.execute(query.instanceId);

    return GroupsResponse.create(result);
  }
}
