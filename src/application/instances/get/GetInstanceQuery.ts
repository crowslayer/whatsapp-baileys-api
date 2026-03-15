import { Query } from '@shared/domain/query/Query';

import { InstanceResponse } from '../InstanceResponse';

export class GetInstanceQuery implements Query<InstanceResponse> {
  constructor(public readonly instanceId: string) {}
}
