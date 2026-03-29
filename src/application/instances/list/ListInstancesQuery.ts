import { InstancesResponse } from '@application/instances/InstancesResponse';

import { Query } from '@shared/domain/query/Query';

export class ListInstancesQuery implements Query<InstancesResponse> {}
