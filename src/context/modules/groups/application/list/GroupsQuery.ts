import { Query } from '@shared/domain/query/Query';

import { GroupsResponse } from '@modules/groups/application/list/GroupsResponse';

export class GroupsQuery extends Query<GroupsResponse> {
  constructor(readonly instanceId: string) {
    super();
  }
}
