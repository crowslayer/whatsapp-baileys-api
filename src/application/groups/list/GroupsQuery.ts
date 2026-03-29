import { GroupsResponse } from '@application/groups/list/GroupsResponse';

import { Query } from '@shared/domain/query/Query';

export class GroupsQuery extends Query<GroupsResponse> {
  constructor(readonly instanceId: string) {
    super();
  }
}
