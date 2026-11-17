import { Query } from '@shared/domain/query/Query';

import { InstancesResponse } from '@modules/instances/application/InstancesResponse';

export class ListInstancesQuery implements Query<InstancesResponse> {}
