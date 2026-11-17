import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { GroupsFinder } from '@modules/groups/application/list/GroupsFinder';
import { GroupsQuery } from '@modules/groups/application/list/GroupsQuery';
import { GroupsResponse } from '@modules/groups/application/list/GroupsResponse';

export class GroupsQueryHandler implements IQueryHandler<GroupsQuery, GroupsResponse> {
  constructor(private readonly useCase: GroupsFinder) {}

  subscribedTo(): typeof GroupsQuery {
    return GroupsQuery;
  }

  async handle(query: GroupsQuery): Promise<GroupsResponse> {
    const result = await this.useCase.execute(query.instanceId);

    return GroupsResponse.create(result);
  }
}
