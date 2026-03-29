import { InstanceResponse } from '@application/instances/InstanceResponse';

import { Query } from '@shared/domain/query/Query';

export class GetInstanceQuery implements Query<InstanceResponse> {
  constructor(public readonly instanceId: string) {}
}
