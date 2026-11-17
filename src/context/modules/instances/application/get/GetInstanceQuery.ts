import { Query } from '@shared/domain/query/Query';

import { InstanceResponse } from '@modules/instances/application/InstanceResponse';

export class GetInstanceQuery implements Query<InstanceResponse> {
  constructor(public readonly instanceId: string) {}
}
